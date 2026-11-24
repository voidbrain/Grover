import { randomUUID } from 'node:crypto';
import {
  feedReason,
  fitModel,
  phaseForDay,
  planFeed,
  type ActuatorKind,
  type DoseModel,
  type FeedDecision,
  type FeedPump,
  type FeedSource,
  type FeedView,
  type Phase,
  type Pot,
  type Reading,
  type Room,
} from '@grover/contracts';
import { isPump } from '@grover/contracts/kinds';
import type { AgentLink } from './agents.ts';
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
  private readonly off: () => void;

  constructor(store: Store, bus: Bus, agents: AgentLink, alerts: Alerts, opts: FeederOptions) {
    this.store = store;
    this.agents = agents;
    this.alerts = alerts;
    this.opts = opts;
    this.now = opts.now ?? Date.now;
    this.off = bus.on((ev) => {
      if (ev.type === 'feed') this.onFeed(ev.feed);
      else if (ev.type === 'reading') void this.onReading(ev.reading);
    });
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

  /** Fitted from finished feeds: pot EC and pH before, and the first reading after it mixed. */
  model(roomId: string): DoseModel {
    const pots = new Map(this.store.listPots(roomId).map((p) => [p.id, p]));
    const nutrient = [];
    const phDown = [];
    for (const f of this.store.feedSamples(roomId)) {
      const pot = pots.get(f.potId);
      if (!pot || !f.ml || !f.batchLiters) continue;
      const liters = pot.liters;
      const nutrientMl = NUTRIENTS.reduce((a, n) => a + (f.ml?.[n] ?? 0), 0);
      if (nutrientMl > 0 && f.ecBefore !== null && f.ecAfter !== null)
        nutrient.push({ ml: nutrientMl, liters, before: f.ecBefore, after: f.ecAfter });
      if ((f.ml['phDown'] ?? 0) > 0 && f.phBefore !== null && f.phAfter !== null)
        phDown.push({ ml: f.ml['phDown']!, liters, before: f.phBefore, after: f.phAfter });
    }
    return fitModel(nutrient, phDown);
  }

  /** What a feed of this pot would do now, without running it. */
  preview(potId: string, feedId = 'preview'): FeedDecision & { ec: number | null; ph: number | null } {
    const pot = this.store.getPot(potId);
    const room = this.store.getRoom(pot.roomId);
    const current = this.phase(room);
    const ec = this.fresh(pot, 'ec');
    const ph = this.fresh(pot, 'ph');
    if (!current) return { ok: false, reason: 'the tent has no active grow calendar', ec, ph };
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

    const decision = this.preview(potId, feedId);
    if (!decision.ok) return refuse(decision.reason);

    const feed: FeedView = {
      ...base,
      message: decision.notes.join('; ') || 'phase dose',
      batchLiters: decision.batchLiters,
      ml: decision.ml,
      ecBefore: decision.ec,
      phBefore: decision.ph,
    };
    this.store.addFeed(feed);
    this.running.set(room.id, feedId);
    try {
      const ack = await this.agents.command(room.agentId, { kind: 'feed', plan: decision.plan });
      if (!ack.ok) {
        this.running.delete(room.id);
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
      this.running.delete(room.id);
      this.store.updateFeed(feedId, 'aborted', (err as Error).message, this.now());
      throw err;
    }
    return this.store.getFeed(feedId)!;
  }

  private onFeed(feed: FeedView): void {
    if (feed.state !== 'done' && feed.state !== 'aborted') return;
    if (this.running.get(feed.roomId) === feed.feedId) this.running.delete(feed.roomId);
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
    const current = this.phase(room);
    if (!current) return;
    for (const pot of pots) {
      if (this.running.has(room.id)) return;
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
