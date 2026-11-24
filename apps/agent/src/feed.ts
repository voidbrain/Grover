import type { FeedPlan, LevelCheck } from '@grover/contracts';
import type { Actuators } from './actuators.ts';

export type FeedState = 'started' | 'step' | 'done' | 'aborted';

export interface FeedDeps {
  actuators: Actuators;
  /** Takes a fresh reading (and reports it to the hub). Throws when the probe fails. */
  read(probeId: string): Promise<number>;
  report(feedId: string, potId: string, state: FeedState, message: string): void;
  /** Interruptible wait; resolves early (false) when the feed is cancelled. */
  sleep?(ms: number, cancelled: () => boolean): Promise<boolean>;
}

class Abort extends Error {}

const defaultSleep = (ms: number, cancelled: () => boolean) =>
  new Promise<boolean>((resolve) => {
    const started = Date.now();
    const tick = setInterval(() => {
      if (cancelled()) {
        clearInterval(tick);
        resolve(false);
      } else if (Date.now() - started >= ms) {
        clearInterval(tick);
        resolve(true);
      }
    }, 100);
  });

/**
 * Runs feeds on the agent, one at a time:
 *
 * 1. checks every level in the plan (supply tanks not low, mixing tank empty, pot not full);
 * 2. runs each supply pump into the mixing tank, re-checking its tank before each run;
 * 3. waits for the batch to settle;
 * 4. runs the pot's transfer pump in short slices until the mixing tank is empty, the pot is full or the
 *    time allowed is used.
 *
 * Any failed check, failed reading, cancel (stop, mode change, new config) or error ends the feed with every
 * actuator off and an `aborted` report saying why. Pump caps and one-pump-at-a-time still hold (Actuators).
 */
export class FeedRunner {
  private current: { feedId: string; cancelled: boolean } | null = null;
  private readonly deps: FeedDeps;
  private readonly sleep: (ms: number, cancelled: () => boolean) => Promise<boolean>;

  constructor(deps: FeedDeps) {
    this.deps = deps;
    this.sleep = deps.sleep ?? defaultSleep;
  }

  get busy(): string | null {
    return this.current?.feedId ?? null;
  }

  /** Stops a running feed (its pumps are switched off by whoever cancels, and by the abort path). */
  cancel(reason = 'cancelled'): void {
    if (this.current) {
      this.current.cancelled = true;
      this.cancelReason = reason;
    }
  }
  private cancelReason = 'cancelled';

  /** Starts a feed in the background. Throws (synchronously) when one is already running or the plan is unusable. */
  start(plan: FeedPlan): Promise<void> {
    if (this.current) throw new Error(`feed ${this.current.feedId} is still running`);
    for (const s of plan.steps)
      if (!this.deps.actuators.has(s.actuatorId))
        throw new Error(`unknown pump ${s.actuatorId}: settings not applied yet?`);
    if (!this.deps.actuators.has(plan.transfer.actuatorId))
      throw new Error(`unknown transfer pump ${plan.transfer.actuatorId}`);
    this.current = { feedId: plan.feedId, cancelled: false };
    this.cancelReason = 'cancelled';
    return this.run(plan);
  }

  private async run(plan: FeedPlan): Promise<void> {
    const { actuators, report } = this.deps;
    const me = this.current!;
    const cancelled = () => me.cancelled;
    const say = (state: FeedState, message: string) => report(plan.feedId, plan.potId, state, message);
    const guard = () => {
      if (me.cancelled) throw new Abort(this.cancelReason);
    };
    try {
      say('started', `${plan.steps.length} pump runs, then transfer`);
      for (const c of plan.checks) await this.check(c);

      for (const step of plan.steps) {
        guard();
        const tankCheck = plan.checks.find((c) => c.what === step.tank && c.min !== null);
        if (tankCheck) await this.check(tankCheck);
        const run = actuators.run(step.actuatorId, step.durationMs, 'feed', plan.feedId);
        await run.done;
        guard();
        say('step', `${step.tank}: ${step.ml} mL`);
      }

      if (plan.settleMs > 0) {
        say('step', `settling ${Math.round(plan.settleMs / 1000)} s`);
        if (!(await this.sleep(plan.settleMs, cancelled))) guard();
      }

      const t = plan.transfer;
      let elapsed = 0;
      let why = 'time allowed used';
      while (elapsed < t.maxMs) {
        guard();
        const slice = Math.min(t.sliceMs, t.maxMs - elapsed);
        const run = actuators.run(t.actuatorId, slice, 'feed', plan.feedId);
        await run.done;
        elapsed += run.durationMs;
        guard();
        if (t.potProbeId && t.potMaxLevel !== null && (await this.level(t.potProbeId, 'pot')) >= t.potMaxLevel) {
          why = 'pot full';
          break;
        }
        if (t.mixProbeId && (await this.level(t.mixProbeId, 'mixing tank')) <= t.mixEmptyLevel) {
          why = 'mixing tank empty';
          break;
        }
      }
      say('done', `transferred for ${Math.round(elapsed / 1000)} s (${why})`);
    } catch (err) {
      await actuators.allOff('safety').catch(() => {});
      say('aborted', (err as Error).message);
    } finally {
      this.current = null;
    }
  }

  private async level(probeId: string, what: string): Promise<number> {
    try {
      return await this.deps.read(probeId);
    } catch (err) {
      throw new Abort(`${what} level could not be read (${(err as Error).message})`);
    }
  }

  private async check(c: LevelCheck): Promise<void> {
    const what = c.what === 'mix' ? 'mixing tank' : c.what === 'pot' ? 'pot' : `${c.what.replace('_', ' ')} tank`;
    const v = await this.level(c.probeId, what);
    if (c.min !== null && v < c.min) throw new Abort(`${what} low (${v}, needs at least ${c.min})`);
    if (c.max !== null && v > c.max)
      throw new Abort(
        c.what === 'mix'
          ? `mixing tank not empty (${v}, empty is ${c.max} or less)`
          : `${what} too full (${v}, at most ${c.max})`,
      );
  }
}
