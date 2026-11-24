import type { Phase, Probe, Reading } from '@grover/contracts';
import { ago, health, targetRange, type Health } from '../format';

export interface Tile {
  probe: Probe;
  title: string;
  unit: string;
  value: number | undefined;
  range: { min: number; max: number } | null;
  health: Health;
  ago: string;
  /** Read from the tent's shared probe, not the pot's own. */
  shared: boolean;
}

/**
 * A probe's latest value judged against its phase range (tank levels have their own alert thresholds instead).
 * Shared by the room card and the rig map.
 */
export function probeTile(
  probe: Probe,
  ctx: { latest: ReadonlyMap<string, Reading>; unit: string; now: number; phase: Phase | null; shared?: boolean },
): Tile {
  const r = ctx.latest.get(probe.id);
  const range = probe.tank ? null : targetRange(probe.kind, ctx.phase);
  return {
    probe,
    title: probe.name,
    unit: ctx.unit,
    value: r?.value,
    range,
    health: health(r?.value, range, r?.at, ctx.now),
    ago: ago(r?.at, ctx.now),
    shared: ctx.shared ?? false,
  };
}
