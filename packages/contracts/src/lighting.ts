import type { Phase, ScheduleRule } from './domain.ts';
import { lightWindow } from './schedule.ts';

/** A pot's phase, as the hub knows it (its plant's, or the tent calendar's). */
export interface PotPhaseEntry {
  potId: string;
  plantId: string | null;
  phase: Phase;
  /** Position of the phase in the calendar, and days since the plant (or tent) started. */
  index: number;
  day: number;
}

/**
 * Which pot the tent's one light follows (F-007): the picked plant when it is in the tent, else the most advanced
 * plant (furthest phase, then most days), else the tent calendar's own entry (`tent`).
 */
export function chooseLightPhase(
  pots: readonly PotPhaseEntry[],
  pickedPlantId: string | null,
  tent: PotPhaseEntry | null,
): PotPhaseEntry | null {
  const withPlants = pots.filter((p) => p.plantId !== null);
  const picked = pickedPlantId ? withPlants.find((p) => p.plantId === pickedPlantId) : undefined;
  if (picked) return picked;
  if (withPlants.length) return [...withPlants].sort((a, b) => b.index - a.index || b.day - a.day)[0]!;
  return tent;
}

/** The light rule for a phase: its hours from `start`; 0 hours keeps it dark, 24 keeps it on. */
export function lightRule(phase: Phase, start: string): Extract<ScheduleRule, { kind: 'window' | 'dark' }> {
  if (phase.lightHours <= 0) return { kind: 'dark' };
  return lightWindow(Math.min(24, phase.lightHours), start);
}
