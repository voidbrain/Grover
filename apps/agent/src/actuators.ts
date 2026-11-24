import { isPump, type Actuation, type ActuationSource, type Actuator } from '@grover/contracts';
import type { ActuatorDriver } from './drivers/types.ts';

interface Slot {
  actuator: Actuator;
  driver: ActuatorDriver;
  on: boolean;
  since: number | null;
  timer: NodeJS.Timeout | null;
  /** Settles the queued run when the pump goes off for any reason (timer, stop, watchdog, failure). */
  release: ((ran: boolean) => void) | null;
  /** The last switch-off failed: the relay may still be on, so it stays "on" and the watchdog retries. */
  stuck: boolean;
  /** A run of this pump is queued or running: another is refused until it ends (B-005). */
  busy: 'waiting' | 'running' | null;
  source: ActuationSource;
  commandId: string | null;
}

/**
 * Owns every actuator on the agent and the safety rules that hold whatever the hub says:
 * - a pump never runs longer than its maxRunMs (timer, plus a watchdog that checks on every tick); a pump
 *   without a cap does not run at all;
 * - only one pump runs at a time (shared supply, and doses must not mix mid-measurement);
 * - pumps only run in bounded runs, never "on" indefinitely;
 * - a stop (Stop all, mode change, config change, shutdown) switches everything off AND drops every run still
 *   waiting, including one whose relay is still switching on: nothing starts after a stop;
 * - a relay that fails to switch off stays reported on until a retry succeeds; so does one whose switch-on failed
 *   and whose switch-off right after failed too (the failed write may have reached it).
 */
export class Actuators {
  private readonly slots = new Map<string, Slot>();
  private pumpQueue: Promise<unknown> = Promise.resolve();
  /** Bumped by every stop; a run queued or switching on under an older epoch never (stays) on. */
  private epoch = 0;
  private readonly emit: (a: Actuation) => void;
  private readonly now: () => number;

  constructor(emit: (a: Actuation) => void, now: () => number = Date.now) {
    this.emit = emit;
    this.now = now;
  }

  async load(entries: { actuator: Actuator; driver: ActuatorDriver }[]): Promise<void> {
    await this.allOff('safety');
    for (const s of this.slots.values()) await s.driver.close?.().catch(() => {});
    this.slots.clear();
    for (const { actuator, driver } of entries) {
      this.slots.set(actuator.id, {
        actuator,
        driver,
        on: false,
        since: null,
        timer: null,
        release: null,
        stuck: false,
        busy: null,
        source: 'safety',
        commandId: null,
      });
      await driver.set(false).catch(() => {});
    }
  }

  has(id: string): boolean {
    return this.slots.has(id);
  }

  get(id: string): Actuator | undefined {
    return this.slots.get(id)?.actuator;
  }

  isOn(id: string): boolean {
    return this.slots.get(id)?.on ?? false;
  }

  active(): string[] {
    return [...this.slots.values()].filter((s) => s.on).map((s) => s.actuator.id);
  }

  /**
   * Bounded pump run, queued behind any other pump. Returns the clamped duration at once; `done` settles when the
   * run is over: true if the pump ran, false if it never started (a stop came first, or switching on failed).
   */
  run(
    id: string,
    durationMs: number,
    source: ActuationSource,
    commandId: string | null = null,
  ): { durationMs: number; done: Promise<boolean> } {
    const slot = this.require(id);
    if (!slot.actuator.enabled) throw new Error(`${id} is disabled`);
    if (!isPump(slot.actuator.kind)) throw new Error(`${id} is not a pump`);
    if (!(slot.actuator.maxRunMs > 0)) throw new Error(`${id} has no run cap (maxRunMs): refusing to run it`);
    const stuck = this.stuckPump();
    if (stuck) throw new Error(`${stuck} failed to switch off: no pump runs until it does`);
    if (slot.busy) throw new Error(`${id} is already ${slot.busy}: wait for it to finish, or Stop all`);
    const ms = Math.max(0, Math.min(durationMs, slot.actuator.maxRunMs));
    const epoch = this.epoch;
    slot.busy = 'waiting';
    const queued = this.pumpQueue.then(
      () =>
        new Promise<boolean>((resolve) => {
          if (
            epoch !== this.epoch ||
            !slot.actuator.enabled ||
            ms === 0 ||
            this.slots.get(id) !== slot ||
            this.stuckPump()
          )
            return resolve(false);
          slot.release = resolve;
          slot.busy = 'running';
          this.turnOn(slot, source, commandId, epoch).then(
            (on) => {
              if (on) slot.timer = setTimeout(() => void this.turnOff(slot, source, commandId), ms);
              else this.settle(slot, false);
            },
            () => this.settle(slot, false),
          );
        }),
    );
    const done = queued.finally(() => {
      slot.busy = null;
    });
    this.pumpQueue = done;
    return { durationMs: ms, done };
  }

  /** Switch kinds only (light, fan, water loop). */
  async switch(id: string, on: boolean, source: ActuationSource, commandId: string | null = null): Promise<void> {
    const slot = this.require(id);
    if (on && !slot.actuator.enabled) throw new Error(`${id} is disabled`);
    if (on && isPump(slot.actuator.kind)) throw new Error(`${id} is a pump: use a bounded run`);
    if (on) {
      if (!(await this.turnOn(slot, source, commandId, this.epoch)))
        throw new Error(`${id}: stopped while switching on`);
    } else await this.turnOff(slot, source, commandId);
  }

  /**
   * Switches off everything (or everything but `except`) and drops every queued run. Runs switching on right now
   * see the new epoch when their driver returns and switch straight off again.
   */
  async allOff(source: ActuationSource, except: (a: Actuator) => boolean = () => false): Promise<void> {
    this.epoch++;
    for (const slot of this.slots.values())
      if ((slot.on || slot.timer) && !except(slot.actuator)) await this.turnOff(slot, source, null);
  }

  /**
   * Watchdog, on every tick: forces off any pump past its cap (in case a timer was lost) and retries any relay
   * whose switch-off failed. Returns the ids it acted on.
   */
  async watchdog(): Promise<string[]> {
    const acted: string[] = [];
    for (const slot of this.slots.values()) {
      const cap = slot.actuator.maxRunMs;
      const overdue =
        slot.on && isPump(slot.actuator.kind) && slot.since !== null && this.now() - slot.since > cap + 1000;
      if (overdue || slot.stuck) {
        await this.turnOff(slot, 'safety', null);
        acted.push(slot.actuator.id);
      }
    }
    return acted;
  }

  /** A pump whose relay failed to switch off, if any. */
  stuckPump(): string | null {
    for (const s of this.slots.values()) if (s.stuck && isPump(s.actuator.kind)) return s.actuator.id;
    return null;
  }

  private require(id: string): Slot {
    const slot = this.slots.get(id);
    if (!slot) throw new Error(`unknown actuator ${id}`);
    return slot;
  }

  /** Switches on unless a stop happened meanwhile (then it makes sure the relay is off). True when on. */
  private async turnOn(slot: Slot, source: ActuationSource, commandId: string | null, epoch: number): Promise<boolean> {
    if (slot.on) return true;
    try {
      await slot.driver.set(true);
    } catch (err) {
      // The write may have reached the relay although it reported an error (B-007, approved by the owner on
      // 2026-11-24): switch it off again; if that fails too, treat it like a failed switch-off (reported on, stuck:
      // no other pump runs, the watchdog retries off).
      await slot.driver.set(false).catch(() => {
        slot.stuck = true;
        slot.on = true;
        slot.since = this.now();
      });
      throw err;
    }
    if (epoch !== this.epoch || this.slots.get(slot.actuator.id) !== slot) {
      // A stop came in while the relay was switching on: it must not stay on.
      await slot.driver.set(false).catch(() => {
        slot.stuck = true;
        slot.on = true;
      });
      return false;
    }
    const at = this.now();
    slot.on = true;
    slot.since = at;
    slot.source = source;
    slot.commandId = commandId;
    this.emit({ actuatorId: slot.actuator.id, state: 'on', at, ranMs: null, source, commandId });
    return true;
  }

  private async turnOff(slot: Slot, source: ActuationSource, commandId: string | null): Promise<void> {
    if (slot.timer) {
      clearTimeout(slot.timer);
      slot.timer = null;
    }
    if (!slot.on) return this.settle(slot, false);
    try {
      await slot.driver.set(false);
    } catch {
      // The relay may still be on: keep it reported on; the watchdog retries on the next tick. Whoever waits on
      // this run is told it did not run cleanly, and no other pump runs meanwhile (one pump at a time).
      slot.stuck = true;
      this.settle(slot, false);
      return;
    }
    slot.stuck = false;
    const at = this.now();
    const ranMs = slot.since !== null ? at - slot.since : null;
    slot.on = false;
    slot.since = null;
    slot.source = source;
    slot.commandId = commandId;
    this.emit({ actuatorId: slot.actuator.id, state: 'off', at, ranMs, source, commandId });
    this.settle(slot, true);
  }

  private settle(slot: Slot, ran: boolean): void {
    const release = slot.release;
    slot.release = null;
    release?.(ran);
  }
}
