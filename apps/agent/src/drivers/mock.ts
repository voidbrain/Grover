import type { Actuator, ActuatorKind, Probe, ProbeKind } from '@grover/contracts';
import type { ActuatorDriver, DriverFactory, ProbeDriver } from './types.ts';

/**
 * A small simulated reservoir so the whole system can run on a laptop:
 * nutrients raise EC (and nudge pH up), pH-down lowers pH, water dilutes, and EC drifts down and pH up over time.
 */
export class MockWorld {
  ec = 1.0;
  ph = 6.4;
  waterTemp = 21;
  airTemp = 25;
  level = 60;
  liters = 20;
  private last = Date.now();
  private readonly now: () => number;
  constructor(now: () => number = Date.now) {
    this.now = now;
  }

  private drift(): void {
    const hours = (this.now() - this.last) / 3_600_000;
    this.last = this.now();
    this.ec = Math.max(0, this.ec - 0.02 * hours);
    this.ph = Math.min(8, this.ph + 0.03 * hours);
  }

  value(kind: ProbeKind): number {
    this.drift();
    const noise = (scale: number) => (Math.random() - 0.5) * scale;
    switch (kind) {
      case 'ec':
        return round(this.ec + noise(0.02), 2);
      case 'ph':
        return round(this.ph + noise(0.02), 2);
      case 'water_temperature':
        return round(this.waterTemp + noise(0.2), 1);
      case 'air_temperature':
        return round(this.airTemp + noise(0.4), 1);
      case 'water_level':
        return round(this.level + noise(0.5), 1);
    }
  }

  /** Effect of `ml` pumped by a pump of `kind`. */
  pumped(kind: ActuatorKind, ml: number): void {
    this.drift();
    const perL = ml / this.liters;
    if (kind === 'pump_grow' || kind === 'pump_micro' || kind === 'pump_bloom' || kind === 'pump_ripen') {
      this.ec += 0.4 * perL;
      this.ph += 0.05 * perL;
    } else if (kind === 'pump_ph_down') this.ph = Math.max(3, this.ph - 2.0 * perL);
    else if (kind === 'pump_water') {
      const added = ml / 1000;
      this.ec = (this.ec * this.liters) / (this.liters + added);
      this.level = Math.min(100, this.level + added);
    }
  }
}

const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;

export class MockDrivers implements DriverFactory {
  readonly world: MockWorld;
  /** Actuator states, for tests. */
  readonly states = new Map<string, boolean>();
  constructor(world = new MockWorld()) {
    this.world = world;
  }

  async probe(probe: Probe): Promise<ProbeDriver> {
    return { read: async () => this.world.value(probe.kind) };
  }

  async actuator(actuator: Actuator): Promise<ActuatorDriver> {
    let since: number | null = null;
    this.states.set(actuator.id, false);
    return {
      set: async (on) => {
        if (on && since === null) since = Date.now();
        if (!on && since !== null) {
          const ms = Date.now() - since;
          since = null;
          this.world.pumped(actuator.kind, (ms / 1000) * (actuator.mlPerSecond ?? 1));
        }
        this.states.set(actuator.id, on);
      },
    };
  }

  async close(): Promise<void> {}
}
