import { randomUUID } from 'node:crypto';
import { createServer, type Server } from 'node:net';
import { Aedes } from 'aedes';
import {
  AgentCommand,
  AgentConfig,
  AgentEvent,
  AgentStatus,
  CommandAck,
  PROTOCOL_VERSION,
  configHash,
  parseTopic,
  topics,
  type AgentView,
} from '@grover/contracts';
import type { Bus } from './events.ts';
import type { Store } from './store.ts';

type CommandBody = AgentCommand extends infer C ? (C extends AgentCommand ? Omit<C, 'id'> : never) : never;

export class AgentOffline extends Error {}
export class CommandTimeout extends Error {}

/**
 * The hub side of the MQTT protocol: an embedded broker, agent authentication and
 * topic authorisation, telemetry intake, retained configs and request/ack commands.
 */
export class AgentLink {
  private broker!: Aedes;
  private server!: Server;
  private readonly online = new Set<string>();
  private readonly configHashes = new Map<string, string>();
  private readonly pending = new Map<string, { resolve: (ack: CommandAck) => void; timer: NodeJS.Timeout }>();
  private readonly store: Store;
  private readonly bus: Bus;
  private readonly opts: { timezone: string; commandTimeoutMs: number };

  constructor(store: Store, bus: Bus, opts: { timezone: string; commandTimeoutMs: number }) {
    this.store = store;
    this.bus = bus;
    this.opts = opts;
  }

  async listen(host: string, port: number): Promise<number> {
    this.broker = await Aedes.createBroker({
      authenticate: (client, username, password, done) => {
        const ok =
          !!username &&
          client.id === username &&
          !!password &&
          this.store.checkAgentToken(username, password.toString());
        if (!ok) {
          const err = Object.assign(new Error('bad credentials'), { returnCode: 4 });
          return done(err as never, false);
        }
        done(null, true);
      },
      authorizePublish: (client, packet, done) => {
        const t = parseTopic(packet.topic);
        const ok =
          !!client &&
          !!t &&
          t.agentId === client.id &&
          (t.kind === 'status' || t.kind === 'events' || t.kind === 'acks');
        done(ok ? null : new Error(`not allowed: ${packet.topic}`));
      },
      authorizeSubscribe: (client, sub, done) => {
        const t = parseTopic(sub.topic);
        const ok = !!client && !!t && t.agentId === client.id && (t.kind === 'config' || t.kind === 'commands');
        done(ok ? null : new Error(`not allowed: ${sub.topic}`), ok ? sub : null);
      },
    });
    this.broker.on('client', (client) => {
      this.online.add(client.id);
      this.store.touchAgent(client.id);
      this.publishConfig(client.id);
      this.emitAgent(client.id);
    });
    this.broker.on('clientDisconnect', (client) => {
      this.online.delete(client.id);
      this.emitAgent(client.id);
    });
    this.broker.on('publish', (packet, client) => {
      if (!client) return;
      this.handle(client.id, packet.topic, packet.payload.toString());
    });

    this.server = createServer(this.broker.handle as never);
    await new Promise<void>((resolve, reject) => {
      this.server.once('error', reject);
      this.server.listen(port, host, () => resolve());
    });
    const address = this.server.address();
    return typeof address === 'object' && address ? address.port : port;
  }

  async close(): Promise<void> {
    for (const p of this.pending.values()) clearTimeout(p.timer);
    await new Promise<void>((r) => this.broker.close(() => r()));
    await new Promise<void>((r) => this.server.close(() => r()));
  }

  /** Drops a connected agent (after its token was revoked or rotated). */
  disconnect(agentId: string): void {
    // `clients` is public in aedes but missing from its type definitions.
    (this.broker as unknown as { clients: Record<string, { close(): void } | undefined> }).clients[agentId]?.close();
  }

  isOnline(agentId: string): boolean {
    return this.online.has(agentId);
  }

  view(agentId: string): AgentView {
    const a = this.store.listAgents().find((x) => x.id === agentId);
    const status = a?.status ?? null;
    return {
      agentId,
      roomId: this.store.roomForAgent(agentId)?.id ?? null,
      online: this.online.has(agentId),
      lastSeen: a?.lastSeen ?? null,
      status,
      configCurrent: !!status && status.configHash === this.configHashes.get(agentId),
    };
  }

  views(): AgentView[] {
    return this.store.listAgents().map((a) => this.view(a.id));
  }

  /** Builds the config an agent runs on. Null when the agent is not attached to a room. */
  buildConfig(agentId: string): AgentConfig | null {
    const room = this.store.roomForAgent(agentId);
    if (!room) return null;
    return AgentConfig.parse({
      protocol: PROTOCOL_VERSION,
      agentId,
      roomId: room.id,
      mode: room.mode,
      probes: this.store.listProbes(room.id),
      actuators: this.store.listActuators(room.id),
      schedules: this.store.roomSchedules(room.id),
      timezone: this.opts.timezone,
      issuedAt: Date.now(),
    });
  }

  /** Publishes (retained) the current config. Call after anything an agent runs on changes. */
  publishConfig(agentId: string): void {
    const config = this.buildConfig(agentId);
    if (!config) return;
    this.configHashes.set(agentId, configHash(config));
    this.broker.publish(
      {
        cmd: 'publish',
        topic: topics.config(agentId),
        payload: Buffer.from(JSON.stringify(config)),
        qos: 1,
        retain: true,
        dup: false,
      },
      () => {},
    );
  }

  publishAllConfigs(): void {
    for (const a of this.store.listAgents()) this.publishConfig(a.id);
  }

  /** Sends a command and waits for the agent's ack. */
  async command(agentId: string, body: CommandBody): Promise<CommandAck> {
    if (!this.online.has(agentId)) throw new AgentOffline(`agent ${agentId} is offline`);
    const cmd = AgentCommand.parse({ ...body, id: randomUUID() });
    const ack = new Promise<CommandAck>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(cmd.id);
        reject(new CommandTimeout(`agent ${agentId} did not answer within ${this.opts.commandTimeoutMs} ms`));
      }, this.opts.commandTimeoutMs);
      this.pending.set(cmd.id, { resolve, timer });
    });
    this.broker.publish(
      {
        cmd: 'publish',
        topic: topics.commands(agentId),
        payload: Buffer.from(JSON.stringify(cmd)),
        qos: 1,
        retain: false,
        dup: false,
      },
      () => {},
    );
    return ack;
  }

  private handle(agentId: string, topic: string, payload: string): void {
    const t = parseTopic(topic);
    if (!t) return;
    let data: unknown;
    try {
      data = JSON.parse(payload);
    } catch {
      return;
    }
    if (t.kind === 'status') {
      const status = AgentStatus.safeParse(data);
      if (!status.success) return;
      this.store.recordAgentStatus(agentId, status.data);
      this.emitAgent(agentId);
    } else if (t.kind === 'acks') {
      const ack = CommandAck.safeParse(data);
      if (!ack.success) return;
      const p = this.pending.get(ack.data.id);
      if (!p) return;
      clearTimeout(p.timer);
      this.pending.delete(ack.data.id);
      p.resolve(ack.data);
    } else if (t.kind === 'events') {
      const parsed = AgentEvent.safeParse(data);
      if (!parsed.success) return;
      const ev = parsed.data;
      this.store.touchAgent(agentId);
      // Inserts are idempotent, so a replay after an outage is stored and announced once.
      if (ev.type === 'reading') {
        if (this.store.addReading(ev.reading)) this.bus.emit({ type: 'reading', reading: ev.reading });
      } else if (ev.type === 'actuation') {
        if (this.store.addActuation(ev.actuation)) this.bus.emit({ type: 'actuation', actuation: ev.actuation });
      } else if (this.store.addFault(agentId, ev.at, ev.subject, ev.message)) {
        this.bus.emit({ type: 'fault', agentId, subject: ev.subject, message: ev.message, at: ev.at });
      }
    }
  }

  private emitAgent(agentId: string): void {
    this.bus.emit({ type: 'agent', agent: this.view(agentId) });
  }
}
