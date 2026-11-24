import { randomUUID } from 'node:crypto';
import {
  feedReason,
  fitModel,
  phaseForDay,
  phaseForPlant,
  planFeed,
  type ActuatorKind,
  type AgentView,
  type DoseModel,
  type FeedDecision,
  type FeedPump,
  type FeedSample,
  type FeedSource,
  type FeedView,
  type Phase,
  type Pot,
  type Reading,
  type Room,
} from '@grover/contracts';
import { isPump } from '@grover/contracts/kinds';
import { CommandTimeout, type AgentLink } from './agents.ts';
import type { Alerts } from './alerts.ts';
import { Refused } from './commands.ts';
import type { Bus } from './events.ts';
import type { Store } from './store.ts';

const DAY = 86_400_000;
const NUTRIENTS = ['grow', 'micro', 'bloom', 'ripen'] as const;

export interface FeederOptions {
  /** Time for a feed to mix into the pot before the next reading counts as its "after". */
  mixMs: number;
  /** A reading older than this is not used to plan a feed. */
  freshMs: number;
  now?: () => number;
}

/**
 * Plans and starts feeds, follows their progress, learns from them, and (when a tent has auto-feed on) starts
 * them when a pot runs low or its EC/pH leaves the phase range. One feed per tent at a time: the mixing tank is
 * shared. The agent runs the feed and enforces every limit; the hub decides what to mix.
 */
export class Feeder {
  private readonly store: Store;
  private readonly agents: AgentLink;
  private readonly alerts: Alerts;
  private readonly opts: FeederOptions;
  private readonly now: () => number;
  /** Rooms with a feed between "sent" and "done/aborted". */
  private readonly running = new Map<string, string>();
  /** Last automatic attempt per pot, refused ones included, so a refused feed is not retried on every reading. */
  private readonly lastAuto = new Map<string, number>();
  /** Feeds the agent has answered for (or whose answer timed out): only then can its status speak for them. */
  private readonly settled = new Map<string, number>();
  private readonly off: () => void;
  private readonly bus: Bus;

  constructor(store: Store, bus: Bus, agents: AgentLink, alerts: Alerts, opts: FeederOptions) {
    this.store = store;
    this.agents = agents;
    this.alerts = alerts;
    this.opts = opts;
    this.now = opts.now ?? Date.now;
    this.bus = bus;
    // Feeds left open by a previous run of the hub: the agent may still be running them. Reserve their tents and
    // let the agent's next status say (onAgent).
    for (const f of store.openFeeds()) {
      this.running.set(f.roomId, f.feedId);
      this.settled.set(f.feedId, 0);
    }
    this.off = bus.on((ev) => {
      if (ev.type === 'feed') this.onFeed(ev.feed);
      else if (ev.type === 'reading') void this.onReading(ev.reading);
      else if (ev.type === 'agent') this.onAgent(ev.agent);
    });
  }

  /** Moves a feed to a final state, announces it and frees its tent. */
  private close(feedId: string, state: 'aborted' | 'refused', message: string): void {
    const feed = this.store.updateFeed(feedId, state, message, this.now());
    if (!feed) return;
    if (this.running.get(feed.roomId) === feedId) this.running.delete(feed.roomId);
    this.settled.delete(feedId);
    this.bus.emit({ type: 'feed', feed });
  }

  /**
   * Keeps the hub's idea of running feeds honest. Going offline proves nothing (a network drop; the agent may
   * still be feeding). A status that says the agent runs no such feed closes it, but only when it is newer than
   * the agent's answer to the feed command and its outbox is empty (a late "done" may still be queued).
   */
  private onAgent(agent: AgentView): void {
    const roomId = agent.roomId;
    if (!roomId || !agent.online || !agent.status) return;
    const feedId = this.running.get(roomId);
    if (!feedId) return;
    const since = this.settled.get(feedId);
    if (since === undefined) return;
    const s = agent.status;
    // Hub time (when the status arrived), not the agent's clock: a Pi without a real-time clock can boot hours behind.
    if (s.feed !== feedId && s.queued === 0 && (agent.lastSeen ?? 0) > since)
      this.close(
        feedId,
        'aborted',
        'the agent is not running this feed (it stopped without a report, or never started)',
      );
  }

  stop(): void {
    this.off();
  }

  phase(room: Room): { phase: Phase; day: number } | null {
    if (!room.calendarId || !room.calendarStart) return null;
    const calendar = this.store.getCalendar(room.calendarId);
    if (!calendar) return null;
    const day = Math.floor((this.now() - Date.parse(room.calendarStart)) / DAY);
    const found = phaseForDay(calendar, day);
    return found ? { phase: found.phase, day } : null;
  }

  /**
   * The phase a pot is fed for: its growing plant's own (from the plant's start, bloom and flush dates), else the
   * tent's calendar (F-013: pots can be staggered).
   */
  potPhase(pot: Pot): { phase: Phase; day: number; source: 'plant' | 'tent'; plantId: string | null } | null {
    const room = this.store.getRoom(pot.roomId);
    const plant = this.store.plantInPot(pot.id);
    const calendar = room.calendarId ? this.store.getCalendar(room.calendarId) : null;
    if (plant && calendar) {
      const found = phaseForPlant(calendar, plant, this.now());
      if (found) return { phase: found.phase, day: found.day, source: 'plant', plantId: plant.id };
    }
    const tent = this.phase(room);
    return tent ? { ...tent, source: 'tent', plantId: plant?.id ?? null } : null;
  }

  /** Fitted from finished feeds: the pot's EC and pH before, what went in, and the first readings after it mixed. */
  model(roomId: string): DoseModel {
    const room = this.store.getRoom(roomId);
    const samples: FeedSample[] = [];
    for (const f of this.store.feedSamples(roomId)) {
      if (!f.ml || f.batchLiters === null || f.potLitersBefore === null) continue;
      samples.push({
        v0: f.potLitersBefore,
        water: f.batchLiters,
        nutrientMl: NUTRIENTS.reduce((a, n) => a + (f.ml?.[n] ?? 0), 0),
        phDownMl: f.ml['phDown'] ?? 0,
        waterEc: room.waterEc,
        waterPh: room.waterPh,
        ecBefore: f.ecBefore,
        ecAfter: f.ecAfter,
        phBefore: f.phBefore,
        phAfter: f.phAfter,
      });
    }
    return fitModel(samples);
  }

  /** What a feed of this pot would do now, without running it. */
  preview(potId: string, feedId = 'preview'): FeedDecision & { ec: number | null; ph: number | null } {
    const pot = this.store.getPot(potId);
    const room = this.store.getRoom(pot.roomId);
    const current = this.potPhase(pot);
    const ec = this.fresh(pot, 'ec');
    const ph = this.fresh(pot, 'ph');
    if (!current)
      return {
        ok: false,
        reason: 'no phase: the tent has no active grow calendar (or the plant in this pot has no start date)',
        ec,
        ph,
      };
    const pumps: Partial<Record<ActuatorKind, FeedPump>> = {};
    let transfer: FeedPump | null = null;
    for (const a of this.store.listActuators(room.id)) {
      if (!a.enabled || !isPump(a.kind)) continue;
      const p = { id: a.id, mlPerSecond: a.mlPerSecond, maxRunMs: a.maxRunMs };
      if (a.potId === null && a.kind !== 'pump_transfer') pumps[a.kind] ??= p;
      if (a.potId === pot.id && a.kind === 'pump_transfer') transfer ??= p;
    }
    const tanks = this.store.tankProbes(room.id);
    const decision = planFeed({
      feedId,
      phase: current.phase,
      pot,
      potLevel: this.fresh(pot, 'water_level'),
      ec,
      ph,
      model: this.model(room.id),
      pumps,
      transfer,
      tankProbes: Object.fromEntries(
        Object.entries(tanks).map(([role, p]) => [role, { id: p.id, alertBelow: p.alertBelow }]),
      ),
      potLevelProbeId: this.store.potProbe(pot, 'water_level')?.id ?? null,
      mixEmptyLevel: room.mixEmptyLevel,
      settleSeconds: room.mixSettleSeconds,
      waterEc: room.waterEc,
      waterPh: room.waterPh,
    });
    return { ...decision, ec, ph };
  }

  /** Plans and starts a feed. Returns the feed as recorded (refused feeds are recorded too, with the reason). */
  async feed(potId: string, source: FeedSource): Promise<FeedView> {
    const pot = this.store.getPot(potId);
    const room = this.store.getRoom(pot.roomId);
    const feedId = randomUUID();
    const base: FeedView = {
      feedId,
      roomId: room.id,
      potId,
      source,
      state: 'planned',
      message: '',
      requestedAt: this.now(),
      finishedAt: null,
      batchLiters: null,
      ml: null,
      ecBefore: null,
      phBefore: null,
      ecAfter: null,
      phAfter: null,
      potLitersBefore: null,
      expectedEc: null,
      expectedPh: null,
    };
    // Whoever asked by hand (or NERV) gets the reason in the answer; an automatic feed that cannot run needs an alert.
    const refuse = (reason: string): FeedView => {
      const feed = { ...base, state: 'refused' as const, message: reason, finishedAt: this.now() };
      this.store.addFeed(feed);
      if (source === 'auto')
        this.alerts.raise({
          key: `feed:${potId}`,
          roomId: room.id,
          potId,
          level: 'warn',
          message: `${pot.name} needs a feed but it was refused: ${reason}.`,
        });
      return feed;
    };

    if (room.mode !== 'normal') return refuse(`the tent is ${room.mode}`);
    if (!room.agentId || !this.agents.isOnline(room.agentId)) return refuse('the agent is offline');
    if (this.running.has(room.id)) return refuse('another feed is running in this tent');
    // Reserve the tent before anything is awaited, so a second request (or an auto-feed set off by the readings
    // below) cannot slip in.
    this.running.set(room.id, feedId);
    const release = () => {
      if (this.running.get(room.id) === feedId) this.running.delete(room.id);
    };

    let decision: ReturnType<Feeder['preview']>;
    let feed: FeedView;
    try {
      try {
        await this.refreshReadings(pot, room.agentId);
      } catch {
        // Readings are best effort.
      }
      decision = this.preview(potId, feedId);
      if (!decision.ok) {
        release();
        return refuse(decision.reason);
      }
      feed = {
        ...base,
        message: decision.notes.join('; ') || 'phase dose',
        batchLiters: decision.batchLiters,
        ml: decision.ml,
        ecBefore: decision.ec,
        phBefore: decision.ph,
        potLitersBefore: decision.potLitersBefore,
        expectedEc: decision.expected.ec,
        expectedPh: decision.expected.ph,
      };
      this.store.addFeed(feed);
    } catch (err) {
      // Anything thrown before the command goes out must not leave the tent reserved.
      release();
      throw err;
    }
    try {
      const ack = await this.agents.command(room.agentId, { kind: 'feed', plan: decision.plan });
      this.settled.set(feedId, this.now());
      if (!ack.ok) {
        release();
        this.store.updateFeed(feedId, 'refused', ack.error ?? 'refused by the agent', this.now());
        if (source === 'auto')
          this.alerts.raise({
            key: `feed:${potId}`,
            roomId: room.id,
            potId,
            level: 'warn',
            message: `${pot.name} needs a feed but the agent refused it: ${ack.error}.`,
          });
      }
    } catch (err) {
      if (err instanceof CommandTimeout) {
        this.settled.set(feedId, this.now());
        // The agent may have started it: keep the feed open and the tent reserved; its next status says
        // whether it runs this feed (see onAgent).
        this.store.updateFeed(feedId, 'planned', `no answer from the agent yet: ${(err as Error).message}`, this.now());
        return this.store.getFeed(feedId)!;
      }
      this.close(feedId, 'aborted', (err as Error).message);
      throw err;
    }
    return this.store.getFeed(feedId)!;
  }

  private onFeed(feed: FeedView): void {
    if (feed.state !== 'done' && feed.state !== 'aborted' && feed.state !== 'refused') return;
    if (this.running.get(feed.roomId) === feed.feedId) this.running.delete(feed.roomId);
    this.settled.delete(feed.feedId);
    if (feed.state === 'refused') return;
    const pot = this.store.listPots().find((p) => p.id === feed.potId);
    if (feed.state === 'done') this.alerts.clear(`feed:${feed.potId}`);
    else
      this.alerts.raise({
        key: `feed:${feed.potId}`,
        roomId: feed.roomId,
        potId: feed.potId,
        level: 'bad',
        message: `${pot?.name ?? feed.potId}: feed stopped, ${feed.message}. Everything was switched off; check the mixing tank.`,
      });
  }

  /** Takes new readings of the pot's level, EC and pH when the last ones are older than the mixing time. */
  private async refreshReadings(pot: Pot, agentId: string): Promise<void> {
    for (const kind of ['water_level', 'ec', 'ph'] as const) {
      const probe = this.store.potProbe(pot, kind);
      if (!probe) continue;
      const last = this.store.latestReading(probe.id);
      if (last && this.now() - last.at < this.opts.mixMs) continue;
      try {
        const ack = await this.agents.command(agentId, { kind: 'read', probeId: probe.id });
        // The reading also arrives as an event; store it now so the plan below sees it.
        if (ack.ok && ack.value !== null) {
          const reading = { probeId: probe.id, value: ack.value, at: ack.at };
          if (this.store.addReading(reading)) this.bus.emit({ type: 'reading', reading });
        }
      } catch {
        // A probe that cannot be read leaves that value unknown; the plan says what it did without it.
      }
    }
  }

  private fresh(pot: Pot, kind: 'ec' | 'ph' | 'water_level'): number | null {
    const probe = this.store.potProbe(pot, kind);
    const r = probe ? this.store.latestReading(probe.id) : null;
    return r && this.now() - r.at <= this.opts.freshMs ? r.value : null;
  }

  private async onReading(r: Reading): Promise<void> {
    let probe;
    try {
      probe = this.store.getProbe(r.probeId);
    } catch {
      return;
    }
    if (probe.tank !== null || !['ec', 'ph', 'water_level'].includes(probe.kind)) return;
    // The pots this reading speaks for: its own pot, or every pot using the tent's shared probe.
    const pots = this.store
      .listPots(probe.roomId)
      .filter((p) => (probe.potId ? p.id === probe.potId : this.store.potProbe(p, probe.kind)?.id === probe.id));

    for (const pot of pots) {
      if (probe.kind === 'ec' || probe.kind === 'ph')
        for (const f of this.store.feedsAwaitingAfter(pot.id, probe.kind, r.at, this.opts.mixMs))
          this.store.setFeedAfter(f.feedId, probe.kind, r.value);
    }

    const room = this.store.getRoom(probe.roomId);
    if (!room.autoFeed || room.mode !== 'normal') return;
    for (const pot of pots) {
      if (this.running.has(room.id)) return;
      const current = this.potPhase(pot);
      if (!current) continue;
      const cooldown = room.feedCooldownMinutes * 60_000;
      const last = Math.max(this.store.lastFeedAt(pot.id) ?? 0, this.lastAuto.get(pot.id) ?? 0);
      if (this.now() - last < cooldown) continue;
      const reason = feedReason(
        current.phase,
        this.fresh(pot, 'water_level'),
        this.fresh(pot, 'ec'),
        this.fresh(pot, 'ph'),
      );
      if (!reason) continue;
      this.lastAuto.set(pot.id, this.now());
      try {
        await this.feed(pot.id, 'auto');
      } catch (err) {
        if (!(err instanceof Refused)) console.error(`auto-feed ${pot.id}: ${(err as Error).message}`);
      }
    }
  }
}
