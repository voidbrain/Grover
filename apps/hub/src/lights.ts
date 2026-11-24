import {
  chooseLightPhase,
  lightRule,
  type AgentConfig,
  type PotPhaseEntry,
  type Room,
  type ScheduleRule,
} from '@grover/contracts';
import type { Feeder } from './feeder.ts';
import type { Store } from './store.ts';

export interface LightPlan {
  rule: Extract<ScheduleRule, { kind: 'window' | 'dark' }>;
  hours: number;
  phaseName: string;
  /** What it follows: a plant (in a pot) or the tent calendar. */
  plantId: string | null;
  potId: string | null;
  picked: boolean;
}

/**
 * The tent's light when it follows the grow calendar (F-007): the hours of the followed phase, from the tent's
 * lights-on time. With staggered pots it follows the picked plant, else the most advanced one, else the tent
 * calendar. Null when the tent keeps its own schedules or has no phase to follow.
 */
export class Lights {
  private readonly store: Store;
  private readonly feeder: Feeder;
  constructor(store: Store, feeder: Feeder) {
    this.store = store;
    this.feeder = feeder;
  }

  plan(room: Room): LightPlan | null {
    if (room.lightFrom !== 'calendar') return null;
    const entries: PotPhaseEntry[] = [];
    for (const pot of this.store.listPots(room.id)) {
      const p = this.feeder.potPhase(pot);
      if (p && p.source === 'plant')
        entries.push({ potId: pot.id, plantId: p.plantId, phase: p.phase, index: p.index, day: p.day });
    }
    const t = this.feeder.phase(room);
    const tent = t ? { potId: '', plantId: null, phase: t.phase, index: t.index, day: t.day } : null;
    const chosen = chooseLightPhase(entries, room.lightPlantId, tent);
    if (!chosen) return null;
    return {
      rule: lightRule(chosen.phase, room.lightStart),
      hours: chosen.phase.lightHours,
      phaseName: chosen.phase.name,
      plantId: chosen.plantId,
      potId: chosen.potId || null,
      picked: chosen.plantId !== null && chosen.plantId === room.lightPlantId,
    };
  }

  /**
   * Rewrites an agent's config: every light in the tent gets the planned rule instead of its own window schedules.
   * The schedules stored by the owner are kept, so switching back to "own schedules" restores them.
   */
  apply(config: AgentConfig): AgentConfig {
    const room = this.store.getRoom(config.roomId);
    const plan = this.plan(room);
    if (!plan) return config;
    const lights = config.actuators.filter((a) => a.kind === 'light').map((a) => a.id);
    const schedules = config.schedules.filter(
      (s) =>
        !(
          s.target.type === 'actuator' &&
          lights.includes(s.target.actuatorId) &&
          (s.rule.kind === 'window' || s.rule.kind === 'dark')
        ),
    );
    // Short ids by position, made unique against the stored ones (light ids can be long and alike).
    const taken = new Set(schedules.map((s) => s.id));
    lights.forEach((id, i) => {
      let sid = `calendar-light-${i + 1}`;
      while (taken.has(sid)) sid = `${sid}-x`;
      taken.add(sid);
      schedules.push({ id: sid, target: { type: 'actuator', actuatorId: id }, rule: plan.rule, enabled: true });
    });
    return { ...config, schedules };
  }
}
