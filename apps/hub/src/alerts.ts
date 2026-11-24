import { TANK_TITLES, type Alert, type Probe, type Reading } from '@grover/contracts';
import type { Bus } from './events.ts';
import type { Store } from './store.ts';

/**
 * Keeps the list of things that need the owner, and announces each change on the bus (the client shows them,
 * NERV picks them up over MCP and delivers them). An alert is raised once and stays until its condition clears.
 *
 * Sources: probe thresholds (`alertBelow` / `alertAbove`, e.g. a supply tank running low), feeds that were
 * refused or aborted (raised by the Feeder), and agents that go offline.
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
    if (probe.alertBelow !== null && r.value < probe.alertBelow)
      this.raise({
        key: below,
        roomId: probe.roomId,
        potId: probe.potId,
        level: 'warn',
        message: lowMessage(probe, r.value),
      });
    else this.clear(below);
    if (probe.alertAbove !== null && r.value > probe.alertAbove)
      this.raise({
        key: above,
        roomId: probe.roomId,
        potId: probe.potId,
        level: 'warn',
        message: `${probe.name} at ${r.value}, above ${probe.alertAbove}.`,
      });
    else this.clear(above);
  }
}

function lowMessage(probe: Probe, value: number): string {
  if (probe.tank && probe.tank !== 'mix')
    return `${TANK_TITLES[probe.tank]} tank low (${value}, alert below ${probe.alertBelow}): refill it. Feeds that need it are refused until then.`;
  return `${probe.name} at ${value}, below ${probe.alertBelow}.`;
}
