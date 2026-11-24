import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import mqtt, { type MqttClient } from 'mqtt';
import {
  AgentCommand,
  AgentConfig,
  applyCalibration,
  COMPENSATION_TEMP_MAX_AGE_MS,
  PROTOCOL_VERSION,
  configHash,
  firesAt,
  isPump,
  localTime,
  topics,
  scheduleOnDay,
  windowActive,
  type AgentStatus,
  type CommandAck,
  type Probe,
} from '@grover/contracts';
import { Actuators } from './actuators.ts';
import { FeedRunner } from './feed.ts';
import type { AgentEnv } from './config.ts';
import type { DriverFactory, ProbeDriver } from './drivers/types.ts';
import { Outbox } from './outbox.ts';

const READ_TIMEOUT_MS = 5000;

/**
 * The agent runs one room's hardware. It keeps running on its last config when the hub is gone:
 * schedules, windows and safety limits all live here. Automatic dosing does not: it needs the hub's
 * model, so without the hub the agent only does what is scheduled.
 */
export class Agent {
  private client: MqttClient | null = null;
  private config: AgentConfig | null = null;
  private hash: string | null = null;
  private probes = new Map<string, { probe: Probe; driver: ProbeDriver }>();
  private readonly actuators: Actuators;
  private readonly feeds: FeedRunner;
  private readonly outbox: Outbox;
  private readonly lastWindow = new Map<string, boolean>();
  private lastMinute = '';
  private ticker: NodeJS.Timeout | null = null;
  private flushing = false;
  private readonly env: AgentEnv;
  private readonly drivers: DriverFactory;
  private readonly now: () => number;
  private applying: Promise<void> = Promise.resolve();

  constructor(env: AgentEnv, drivers: DriverFactory, now: () => number = Date.now) {
    this.env = env;
    this.drivers = drivers;
    this.now = now;
    mkdirSync(env.stateDir, { recursive: true });
    this.outbox = new Outbox(join(env.stateDir, 'outbox.sqlite'));
    this.actuators = new Actuators((actuation) => this.publishEvent({ type: 'actuation', actuation }), now);
    this.feeds = new FeedRunner({
      actuators: this.actuators,
      read: (probeId) => this.read(probeId),
      report: (feedId, potId, state, message) =>
        this.publishEvent({ type: 'feed', at: this.now(), feedId, potId, state, message }),
    });
  }

  private get configPath(): string {
    return join(this.env.stateDir, 'config.json');
  }

  async start(): Promise<void> {
    try {
      await this.apply(AgentConfig.parse(JSON.parse(readFileSync(this.configPath, 'utf8'))), false);
    } catch {
      // No cached config yet: wait for the hub.
    }
    this.ticker = setInterval(() => void this.tick(), 1000);

    const will = this.statusPayload('offline');
    this.client = mqtt.connect(this.env.hubUrl, {
      clientId: this.env.agentId,
      username: this.env.agentId,
      password: this.env.token,
      clean: false,
      reconnectPeriod: 5000,
      will: { topic: topics.status(this.env.agentId), payload: Buffer.from(will), qos: 1, retain: true },
    });
    this.client.on('connect', () => {
      this.client!.subscribe([topics.config(this.env.agentId), topics.commands(this.env.agentId)], { qos: 1 });
      this.publishStatus();
      void this.flush();
    });
    this.client.on('message', (topic, payload) => void this.onMessage(topic, payload.toString()));
    this.client.on('error', (err) => console.error(`mqtt: ${err.message}`));
  }

  async stop(): Promise<void> {
    if (this.ticker) clearInterval(this.ticker);
    this.feeds.cancel('the agent is stopping');
    await this.actuators.allOff('safety');
    // Let a cancelled feed report its abort before the outbox closes (bounded: never block a shutdown).
    await Promise.race([this.feeds.idle(), new Promise((r) => setTimeout(r, 2000))]);
    if (this.client?.connected) {
      await new Promise<void>((r) =>
        this.client!.publish(
          topics.status(this.env.agentId),
          this.statusPayload('offline'),
          { qos: 1, retain: true },
          () => r(),
        ),
      );
    }
    // Force: with the hub unreachable a graceful end would wait for a connection that never comes.
    await this.client?.endAsync(true);
    await this.drivers.close();
    this.outbox.close();
  }

  get state(): {
    config: AgentConfig | null;
    active: string[];
    queued: number;
    connected: boolean;
    feed: string | null;
  } {
    return {
      feed: this.feeds.busy,
      config: this.config,
      active: this.actuators.active(),
      queued: this.outbox.size(),
      connected: !!this.client?.connected,
    };
  }

  // ── config ───────────────────────────────────────────────────────────────
  private apply(config: AgentConfig, persist = true): Promise<void> {
    this.applying = this.applying.then(() => this.doApply(config, persist));
    return this.applying;
  }

  private async doApply(config: AgentConfig, persist: boolean): Promise<void> {
    const hash = configHash(config);
    const modeOnly = this.config !== null && this.hash !== null && sameHardware(this.config, config);
    // A feed survives a settings change that leaves its hardware alone, but not a mode change away from normal.
    if (!modeOnly) this.feeds.cancel('the hardware settings changed');
    else if (config.mode !== 'normal') this.feeds.cancel(`the tent was set to ${config.mode}`);
    this.config = config;
    this.hash = hash;
    if (persist) writeFileSync(this.configPath, JSON.stringify(config));

    if (!modeOnly) {
      for (const p of this.probes.values()) await p.driver.close?.().catch(() => {});
      this.probes.clear();
      for (const probe of config.probes.filter((p) => p.enabled)) {
        try {
          this.probes.set(probe.id, { probe, driver: await this.drivers.probe(probe) });
        } catch (err) {
          this.fault(`probe ${probe.id}`, (err as Error).message);
        }
      }
      const entries = [];
      for (const actuator of config.actuators) {
        try {
          entries.push({ actuator, driver: await this.drivers.actuator(actuator) });
        } catch (err) {
          this.fault(`actuator ${actuator.id}`, (err as Error).message);
        }
      }
      await this.actuators.load(entries);
    }
    await this.enforceMode();
    this.lastWindow.clear();
    this.lastMinute = '';
    this.publishStatus();
    await this.tick();
  }

  private async enforceMode(): Promise<void> {
    const mode = this.config?.mode ?? 'off';
    if (mode === 'off') await this.actuators.allOff('safety');
    else if (mode === 'silent') await this.actuators.allOff('safety', (a) => a.kind === 'light');
  }

  // ── schedule ─────────────────────────────────────────────────────────────
  async tick(): Promise<void> {
    for (const id of await this.actuators.watchdog())
      this.fault(`actuator ${id}`, 'ran past its cap: forced off by the watchdog');
    const config = this.config;
    if (!config || config.mode === 'off') return;
    const { day, minuteOfDay } = localTime(new Date(this.now()), config.timezone);
    const minuteKey = `${day} ${minuteOfDay}`;
    const newMinute = minuteKey !== this.lastMinute;
    this.lastMinute = minuteKey;

    for (const s of config.schedules) {
      if (!s.enabled) continue;
      // Not one of its days (F-016): a window holds off, dark is not held, nothing fires.
      const onDay = scheduleOnDay(s, day, minuteOfDay);
      if (s.target.type === 'probe') {
        if (newMinute && onDay && firesAt(s.rule, minuteOfDay)) void this.read(s.target.probeId).catch(() => {});
        continue;
      }
      const actuator = this.actuators.get(s.target.actuatorId);
      if (!actuator || !actuator.enabled) continue;
      const allowed = config.mode === 'normal' || actuator.kind === 'light';
      if (s.rule.kind === 'window' || s.rule.kind === 'dark') {
        const want = allowed && onDay && s.rule.kind === 'window' && windowActive(s.rule, minuteOfDay);
        // Dark is held, not just switched at an edge: a light switched on by hand goes off again on the next tick.
        if (s.rule.kind === 'dark' && onDay && this.actuators.isOn(actuator.id)) {
          await this.actuators
            .switch(actuator.id, false, 'schedule')
            .catch((err) => this.fault(`actuator ${actuator.id}`, err.message));
          continue;
        }
        // Act on edges only, so a manual switch holds until the next window boundary.
        if (this.lastWindow.get(s.id) !== want) {
          this.lastWindow.set(s.id, want);
          if (this.actuators.isOn(actuator.id) !== want)
            await this.actuators.switch(actuator.id, want, 'schedule').catch((err) => {
              // Forget the edge so the next tick tries again (a relay that was busy, a stop in between).
              this.lastWindow.delete(s.id);
              this.fault(`actuator ${actuator.id}`, err.message);
            });
        }
      } else if (
        newMinute &&
        allowed &&
        onDay &&
        firesAt(s.rule, minuteOfDay) &&
        !(isPump(actuator.kind) && this.feeds.busy)
      ) {
        if (isPump(actuator.kind)) {
          try {
            this.actuators.run(actuator.id, s.rule.durationMs, 'schedule');
          } catch (err) {
            this.fault(`actuator ${actuator.id}`, (err as Error).message);
          }
        } else if (s.rule.durationMs > 0) {
          await this.actuators.switch(actuator.id, true, 'schedule').catch(() => {});
          setTimeout(
            () => void this.actuators.switch(actuator.id, false, 'schedule').catch(() => {}),
            s.rule.durationMs,
          );
        }
      }
    }
  }

  // ── probes ───────────────────────────────────────────────────────────────
  async read(probeId: string): Promise<number> {
    return (await this.takeReading(probeId)).value;
  }

  /** Last calibrated value per probe: the temperature a calibration compensates with. */
  private readonly lastValues = new Map<string, { value: number; at: number }>();

  /**
   * A reading, its time and the calibration it applied; the command ack for a read carries the same time, so the hub
   * stores it once, and the same `calibratedAt`, so the hub keeps only readings made with its current calibration.
   */
  private async takeReading(
    probeId: string,
    raw = false,
  ): Promise<{ value: number; at: number; calibratedAt: number | null }> {
    const entry = this.probes.get(probeId);
    if (!entry) throw new Error(`unknown or disabled probe ${probeId}`);
    try {
      const reading = await withTimeout(entry.driver.read(), READ_TIMEOUT_MS, `probe ${probeId} timed out`);
      if (!Number.isFinite(reading)) throw new Error(`probe ${probeId} returned ${reading}`);
      const at = this.now();
      // A raw read is for taking calibration points: the driver's value, not stored as a measurement.
      if (raw) return { value: reading, at, calibratedAt: null };
      const cal = entry.probe.calibration;
      const temp = cal?.tempProbeId ? this.lastValues.get(cal.tempProbeId) : undefined;
      // A stale temperature is not compensated with (applyCalibration also ignores one outside 0–50 °C).
      const tempC = temp && at - temp.at <= COMPENSATION_TEMP_MAX_AGE_MS ? temp.value : null;
      const value = cal ? applyCalibration(reading, cal, tempC) : reading;
      this.lastValues.set(probeId, { value, at });
      const calibratedAt = cal?.calibratedAt ?? null;
      this.publishEvent({ type: 'reading', reading: { probeId, value, at }, calibratedAt });
      return { value, at, calibratedAt };
    } catch (err) {
      this.fault(`probe ${probeId}`, (err as Error).message);
      throw err;
    }
  }

  // ── commands ─────────────────────────────────────────────────────────────
  private async onMessage(topic: string, payload: string): Promise<void> {
    let data: unknown;
    try {
      data = JSON.parse(payload);
    } catch {
      return;
    }
    if (topic === topics.config(this.env.agentId)) {
      const parsed = AgentConfig.safeParse(data);
      if (!parsed.success) return this.fault('config', parsed.error.message);
      if (parsed.data.agentId !== this.env.agentId) return this.fault('config', `config is for ${parsed.data.agentId}`);
      if (configHash(parsed.data) === this.hash) return;
      await this.apply(parsed.data);
    } else if (topic === topics.commands(this.env.agentId)) {
      const parsed = AgentCommand.safeParse(data);
      if (!parsed.success) return;
      this.ack(await this.execute(parsed.data));
    }
  }

  async execute(cmd: AgentCommand): Promise<CommandAck> {
    const ack = (
      ok: boolean,
      error: string | null,
      value: number | null = null,
      at = this.now(),
      calibratedAt: number | null = null,
    ): CommandAck => ({ id: cmd.id, ok, error, value, at, calibratedAt });
    try {
      const mode = this.config?.mode ?? 'off';
      switch (cmd.kind) {
        case 'read':
          if (mode === 'off') return ack(false, 'agent is off');
          {
            const r = await this.takeReading(cmd.probeId, cmd.raw);
            return ack(true, null, r.value, r.at, r.calibratedAt);
          }
        case 'run': {
          if (mode !== 'normal') return ack(false, `agent is ${mode}`);
          if (this.feeds.busy) return ack(false, 'a feed is running: wait for it, or Stop all');
          const { durationMs } = this.actuators.run(cmd.actuatorId, cmd.durationMs, cmd.source, cmd.id);
          return ack(true, null, durationMs);
        }
        case 'switch': {
          const a = this.actuators.get(cmd.actuatorId);
          if (cmd.on && (mode === 'off' || (mode === 'silent' && a?.kind !== 'light')))
            return ack(false, `agent is ${mode}`);
          await this.actuators.switch(cmd.actuatorId, cmd.on, cmd.source, cmd.id);
          return ack(true, null, cmd.on ? 1 : 0);
        }
        case 'stop_all':
          this.feeds.cancel('stopped with Stop all');
          await this.actuators.allOff(cmd.source);
          return ack(true, null);
        case 'feed': {
          if (mode !== 'normal') return ack(false, `agent is ${mode}`);
          void this.feeds.start(cmd.plan);
          return ack(true, null);
        }
      }
    } catch (err) {
      return ack(false, (err as Error).message);
    }
  }

  // ── outbound ─────────────────────────────────────────────────────────────
  private ack(a: CommandAck): void {
    this.client?.publish(topics.acks(this.env.agentId), JSON.stringify(a), { qos: 1 });
  }

  private fault(subject: string, message: string): void {
    console.error(`fault ${subject}: ${message}`);
    this.publishEvent({ type: 'fault', at: this.now(), subject, message });
  }

  private publishEvent(body: Parameters<Outbox['push']>[0]): void {
    this.outbox.push(body);
    if (body.type === 'actuation' || (body.type === 'feed' && body.state !== 'step')) this.publishStatus();
    void this.flush();
  }

  /** Sends queued events in order; each leaves the outbox only once the broker has it. */
  private async flush(): Promise<void> {
    if (this.flushing || !this.client?.connected) return;
    this.flushing = true;
    try {
      for (;;) {
        const batch = this.outbox.peek();
        if (batch.length === 0) break;
        for (const ev of batch) {
          if (!this.client?.connected) return;
          await this.client.publishAsync(topics.events(this.env.agentId), JSON.stringify(ev), { qos: 1 });
          this.outbox.ack(ev.seq);
        }
      }
      // Everything sent: say so, so the hub knows no feed report is still on its way.
      this.publishStatus();
    } catch {
      // Disconnected mid-flush: the rest stays queued for the next connect.
    } finally {
      this.flushing = false;
    }
  }

  private statusPayload(state: 'online' | 'offline'): string {
    const s: AgentStatus = {
      state,
      protocol: PROTOCOL_VERSION,
      version: this.env.version,
      configHash: this.hash,
      mode: this.config?.mode ?? null,
      active: state === 'online' ? this.actuators.active() : [],
      feed: state === 'online' ? this.feeds.busy : null,
      queued: this.outbox.size(),
      at: this.now(),
    };
    return JSON.stringify(s);
  }

  private publishStatus(): void {
    if (this.client?.connected)
      this.client.publish(topics.status(this.env.agentId), this.statusPayload('online'), { qos: 1, retain: true });
  }
}

/** True when only the mode (or schedules) changed, so drivers need not be rebuilt. */
function sameHardware(a: AgentConfig, b: AgentConfig): boolean {
  return JSON.stringify([a.probes, a.actuators]) === JSON.stringify([b.probes, b.actuators]);
}

function withTimeout<T>(p: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(message)), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}
