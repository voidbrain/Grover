import type { Actuator, ActuatorKind, Probe } from '@grover/contracts';
import type { TankRoleId } from '@grover/contracts/kinds';
import type { ActuatorDriver, DriverFactory, ProbeDriver } from './types.ts';

/** A body of solution: how much, and what is dissolved in it. */
interface Solution {
  liters: number;
  nutrientMl: number;
  phDownMl: number;
}

const ec = (s: Solution) => (s.liters > 0 ? 0.2 + (0.4 * s.nutrientMl) / s.liters : 0);
const ph = (s: Solution) =>
  s.liters > 0 ? Math.min(8, Math.max(3, 7.0 + (0.05 * s.nutrientMl) / s.liters - (2.0 * s.phDownMl) / s.liters)) : 7;
const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;

/** Litres per cm of level, per tank (the level probes read cm). */
const TANK_L_PER_CM: Record<TankRoleId, number> = {
  water: 2,
  grow: 0.05,
  micro: 0.05,
  bloom: 0.05,
  ripen: 0.05,
  ph_down: 0.025,
  mix: 0.2,
};
const POT_L_PER_CM = 0.5;
const SUPPLY_PUMP: Partial<Record<ActuatorKind, Exclude<TankRoleId, 'mix'>>> = {
  pump_water: 'water',
  pump_grow: 'grow',
  pump_micro: 'micro',
  pump_bloom: 'bloom',
  pump_ripen: 'ripen',
  pump_ph_down: 'ph_down',
};

/**
 * A simulated rig so the whole system runs on a laptop: supply tanks pump into a mixing tank, transfer pumps
 * move the mix into pots, plants drink and use nutrients, pH drifts up. Probes read levels (cm), EC and pH from it.
 */
export class MockWorld {
  readonly supply: Record<Exclude<TankRoleId, 'mix'>, number> = {
    water: 50,
    grow: 1,
    micro: 1,
    bloom: 1,
    ripen: 1,
    ph_down: 0.5,
  };
  readonly mix: Solution = { liters: 0, nutrientMl: 0, phDownMl: 0 };
  readonly pots = new Map<string, Solution>();
  airTemp = 25;
  waterTemp = 21;
  private last: number;
  private readonly now: () => number;

  constructor(now: () => number = Date.now) {
    this.now = now;
    this.last = now();
  }

  pot(id: string): Solution {
    let p = this.pots.get(id);
    if (!p) {
      p = { liters: 10, nutrientMl: 20, phDownMl: 0.5 };
      this.pots.set(id, p);
    }
    return p;
  }

  private drift(): void {
    const hours = (this.now() - this.last) / 3_600_000;
    this.last = this.now();
    if (hours <= 0) return;
    for (const p of this.pots.values()) {
      p.liters = Math.max(0, p.liters - 0.3 * hours);
      p.nutrientMl *= Math.pow(0.98, hours);
      p.phDownMl *= Math.pow(0.97, hours);
    }
  }

  read(probe: Pick<Probe, 'kind' | 'potId' | 'tank'>): number {
    this.drift();
    const noise = (scale: number) => (Math.random() - 0.5) * scale;
    // The tent's shared pH/EC pair sits in the first pot.
    const solution = probe.potId ? this.pot(probe.potId) : (this.pots.values().next().value ?? this.pot('shared'));
    switch (probe.kind) {
      case 'water_level':
        if (probe.tank === 'mix') return round(this.mix.liters / TANK_L_PER_CM.mix, 1);
        if (probe.tank) return round(this.supply[probe.tank] / TANK_L_PER_CM[probe.tank], 1);
        return probe.potId ? round(this.pot(probe.potId).liters / POT_L_PER_CM, 1) : 50;
      case 'ec':
        return round(ec(solution) + noise(0.02), 2);
      case 'ph':
        return round(ph(solution) + noise(0.02), 2);
      case 'water_temperature':
        return round(this.waterTemp + noise(0.2), 1);
      case 'air_temperature':
        return round(this.airTemp + noise(0.4), 1);
    }
  }

  /** Effect of `ml` pumped by an actuator. */
  pumped(actuator: Pick<Actuator, 'kind' | 'potId'>, ml: number): void {
    this.drift();
    const source = SUPPLY_PUMP[actuator.kind];
    if (source) {
      const liters = Math.min(ml / 1000, this.supply[source]);
      this.supply[source] -= liters;
      this.mix.liters += liters;
      if (source === 'ph_down') this.mix.phDownMl += liters * 1000;
      else if (source !== 'water') this.mix.nutrientMl += liters * 1000;
    } else if (actuator.kind === 'pump_transfer' && actuator.potId) {
      const moved = Math.min(ml / 1000, this.mix.liters);
      if (moved <= 0) return;
      const share = moved / this.mix.liters;
      const pot = this.pot(actuator.potId);
      pot.liters += moved;
      pot.nutrientMl += this.mix.nutrientMl * share;
      pot.phDownMl += this.mix.phDownMl * share;
      this.mix.liters -= moved;
      this.mix.nutrientMl -= this.mix.nutrientMl * share;
      this.mix.phDownMl -= this.mix.phDownMl * share;
    }
  }
}

export class MockDrivers implements DriverFactory {
  readonly world: MockWorld;
  /** Actuator states, for tests. */
  readonly states = new Map<string, boolean>();
  constructor(world = new MockWorld()) {
    this.world = world;
  }

  async probe(probe: Probe): Promise<ProbeDriver> {
    return { read: async () => this.world.read(probe) };
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
          this.world.pumped(actuator, (ms / 1000) * (actuator.mlPerSecond ?? 1));
        }
        this.states.set(actuator.id, on);
      },
    };
  }

  async close(): Promise<void> {}
}
