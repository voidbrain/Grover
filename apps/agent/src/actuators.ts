import { isPump, type Actuation, type ActuationSource, type Actuator } from '@grover/contracts';
import type { ActuatorDriver } from './drivers/types.ts';

interface Slot {
  actuator: Actuator;
  driver: ActuatorDriver;
  on: boolean;
  since: number | null;
  timer: NodeJS.Timeout | null;
  /** Settles the queued run when the pump goes off for any reason (timer, stop, watchdog, failure). */
  release: (() => void) | null;
  source: ActuationSource;
  commandId: string | null;
}

/**
 * Owns every actuator on the agent and the safety rules that hold whatever the hub says:
 * - a pump never runs longer than its maxRunMs (timer, plus a watchdog that checks on every tick);
 * - only one pump runs at a time (shared supply, and doses must not mix mid-measurement);
 * - pumps only run in bounded runs, never "on" indefinitely;
 * - everything goes off on stop, on shutdown and when the config changes.
 */
export class Actuators {
  private readonly slots = new Map<string, Slot>();
  private pumpQueue: Promise<void> = Promise.resolve();
  private readonly emit: (a: Actuation) => void;
  private readonly now: () => number;

  constructor(emit: (a: Actuation) => void, now: () => number = Date.now) {
    this.emit = emit;
    this.now = now;
  }

  async load(entries: { actuator: Actuator; driver: ActuatorDriver }[]): Promise<void> {
    // Runs still queued on the old slots must not start: disable them before switching everything off.
    for (const s of this.slots.values()) s.actuator = { ...s.actuator, enabled: false };
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

  /** Bounded pump run, queued behind any other pump. Resolves with the clamped duration once queued. */
  run(
    id: string,
    durationMs: number,
    source: ActuationSource,
    commandId: string | null = null,
  ): { durationMs: number; done: Promise<void> } {
    const slot = this.require(id);
    if (!slot.actuator.enabled) throw new Error(`${id} is disabled`);
    if (!isPump(slot.actuator.kind)) throw new Error(`${id} is not a pump`);
    const cap = slot.actuator.maxRunMs > 0 ? slot.actuator.maxRunMs : durationMs;
    const ms = Math.max(0, Math.min(durationMs, cap));
    const done = (this.pumpQueue = this.pumpQueue.then(
      () =>
        new Promise<void>((resolve) => {
          if (!slot.actuator.enabled || ms === 0) return resolve();
          slot.release = resolve;
          this.turn(slot, true, source, commandId).then(
            () => {
              if (slot.on) slot.timer = setTimeout(() => void this.turn(slot, false, source, commandId), ms);
              else resolve();
            },
            () => {
              slot.release = null;
              resolve();
            },
          );
        }),
    ));
    return { durationMs: ms, done };
  }

  /** Switch kinds only (light, fan, water loop). */
  async switch(id: string, on: boolean, source: ActuationSource, commandId: string | null = null): Promise<void> {
    const slot = this.require(id);
    if (on && !slot.actuator.enabled) throw new Error(`${id} is disabled`);
    if (on && isPump(slot.actuator.kind)) throw new Error(`${id} is a pump: use a bounded run`);
    await this.turn(slot, on, source, commandId);
  }

  async allOff(source: ActuationSource, except: (a: Actuator) => boolean = () => false): Promise<void> {
    for (const slot of this.slots.values())
      if (slot.on && !except(slot.actuator)) await this.turn(slot, false, source, null);
  }

  /** Watchdog: forces off any pump past its cap (in case a timer was lost). Returns the ids it stopped. */
  async watchdog(): Promise<string[]> {
    const stopped: string[] = [];
    for (const slot of this.slots.values()) {
      const cap = slot.actuator.maxRunMs;
      if (
        slot.on &&
        isPump(slot.actuator.kind) &&
        cap > 0 &&
        slot.since !== null &&
        this.now() - slot.since > cap + 1000
      ) {
        await this.turn(slot, false, 'safety', null);
        stopped.push(slot.actuator.id);
      }
    }
    return stopped;
  }

  private require(id: string): Slot {
    const slot = this.slots.get(id);
    if (!slot) throw new Error(`unknown actuator ${id}`);
    return slot;
  }

  private async turn(slot: Slot, on: boolean, source: ActuationSource, commandId: string | null): Promise<void> {
    if (!on && slot.timer) {
      clearTimeout(slot.timer);
      slot.timer = null;
    }
    if (slot.on === on) return;
    try {
      await slot.driver.set(on);
    } catch (err) {
      if (on) throw err;
      // Turning off failed: keep trying in the background, the watchdog will retry too.
      setTimeout(() => void slot.driver.set(false).catch(() => {}), 500);
    }
    const at = this.now();
    const ranMs = !on && slot.since !== null ? at - slot.since : null;
    slot.on = on;
    slot.since = on ? at : null;
    slot.source = source;
    slot.commandId = commandId;
    this.emit({ actuatorId: slot.actuator.id, state: on ? 'on' : 'off', at, ranMs, source, commandId });
    if (!on && slot.release) {
      const release = slot.release;
      slot.release = null;
      release();
    }
  }
}
