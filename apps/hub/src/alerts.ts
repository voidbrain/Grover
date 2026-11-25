import { TANK_TITLES, alertMargin, type Alert, type Probe, type Reading } from '@grover/contracts';
import type { Bus } from './events.ts';
import type { Store } from './store.ts';

/**
 * Keeps the list of things that need the owner, and announces each change on the bus (the client shows them,
 * NERV picks them up over MCP and delivers them). An alert is raised once and stays until its condition clears.
 *
 * Sources: probe thresholds (`alertBelow` / `alertAbove`, e.g. a supply tank running low; clears only past the
 * probe kind's hysteresis margin so a reading at the threshold does not flap), feeds that were refused or aborted
 * (raised by the Feeder), and agents that go offline.
 */
export class Alerts {
  private readonly store: Store;
  private readonly bus: Bus;
  private readonly now: () => number;
  private readonly off: () => void;

  constructor(store: Store, bus: Bus, now: () => number = Date.now) {
    this.store = store;
    this.bus = bus;
    this.now = now;
    this.off = bus.on((ev) => {
      if (ev.type === 'reading') this.onReading(ev.reading);
      else if (ev.type === 'agent') {
        const room = ev.agent.roomId;
        if (!room) return;
        const key = `agent:${ev.agent.agentId}`;
        if (ev.agent.online) this.clear(key);
        else
          this.raise({
            key,
            roomId: room,
            potId: null,
            level: 'bad',
            message: `Agent ${ev.agent.agentId} is offline: the tent runs on its own schedules, no feeds.`,
          });
      }
    });
  }

  stop(): void {
    this.off();
  }

  list(): Alert[] {
    return this.store.alerts();
  }

  raise(a: Omit<Alert, 'since'>): void {
    const alert = { ...a, since: this.now() };
    if (this.store.raiseAlert(alert)) this.bus.emit({ type: 'alert', alert, cleared: false });
  }

  clear(key: string): void {
    const alert = this.store.clearAlert(key);
    if (alert) this.bus.emit({ type: 'alert', alert, cleared: true });
  }

  private onReading(r: Reading): void {
    let probe: Probe;
    try {
      probe = this.store.getProbe(r.probeId);
    } catch {
      return;
    }
    // Volts from an uncalibrated analog pH/EC probe say nothing about the solution (F-004).
    if (this.store.needsCalibration(probe) || r.at < (probe.calibration?.calibratedAt ?? 0)) return;
    const below = `probe:${probe.id}:below`;
    const above = `probe:${probe.id}:above`;
    const active = new Set(this.store.alerts().map((a) => a.key));
    const margin = alertMargin(probe);
    if (probe.alertBelow === null) {
      this.clear(below);
    } else {
      const clearAt = probe.alertBelow + margin;
      const isBelow = r.value < probe.alertBelow - EPSILON;
      const held = !isBelow && active.has(below) && r.value < clearAt - EPSILON;
      if (isBelow || held) {
        this.raise({
          key: below,
          roomId: probe.roomId,
          potId: probe.potId,
          level: 'warn',
          message: belowMessage(probe, r.value, held, clearAt),
        });
      } else {
        this.clear(below);
      }
    }
    if (probe.alertAbove === null) {
      this.clear(above);
    } else {
      const clearAt = probe.alertAbove - margin;
      const isAbove = r.value > probe.alertAbove + EPSILON;
      const held = !isAbove && active.has(above) && r.value > clearAt + EPSILON;
      if (isAbove || held) {
        this.raise({
          key: above,
          roomId: probe.roomId,
          potId: probe.potId,
          level: 'warn',
          message: aboveMessage(probe, r.value, held, clearAt),
        });
      } else {
        this.clear(above);
      }
    }
  }
}

/** Floating-point tolerance for threshold and clear-point comparisons (e.g. 0.2 + 0.1 or 0.7 - 0.4). */
const EPSILON = 1e-9;

/** Strips IEEE-754 rounding noise (e.g. 0.30000000000000004 -> 0.3) from formatted values and bounds. */
const clean = (n: number): number => Number(n.toPrecision(12));

function belowMessage(probe: Probe, value: number, held: boolean, clearAt: number): string {
  const v = clean(value);
  const threshold = clean(probe.alertBelow!);
  const clear = clean(clearAt);
  if (probe.tank && probe.tank !== 'mix') {
    if (held) {
      return `${TANK_TITLES[probe.tank]} tank at ${v} (threshold ${threshold}, alert held until at least ${clear}): refill it.`;
    }
    return `${TANK_TITLES[probe.tank]} tank low (${v}, alert below ${threshold}): refill it. Feeds that need it are refused until then.`;
  }
  if (held) {
    return `${probe.name} at ${v} (threshold ${threshold}, alert held until at least ${clear}).`;
  }
  return `${probe.name} at ${v}, below ${threshold}.`;
}

function aboveMessage(probe: Probe, value: number, held: boolean, clearAt: number): string {
  const v = clean(value);
  const threshold = clean(probe.alertAbove!);
  const clear = clean(clearAt);
  if (held) {
    return `${probe.name} at ${v} (threshold ${threshold}, alert held until at most ${clear}).`;
  }
  return `${probe.name} at ${v}, above ${threshold}.`;
}
