import type { Calendar, Phase } from './domain.ts';
import { daysBetween, phaseForPlant, type PlantDates } from './dosing.ts';

/**
 * The plant page (F-014): the phases a plant went through, and what it got and how its pot held. Pure, so the hub
 * computes it from stored data and tests pin it.
 */

/** The calendar date `n` days after `day` (YYYY-MM-DD). */
export function addDays(day: string, n: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
}

/** A stretch of days (inclusive) the plant spent in one phase of its calendar. */
export interface PhaseSpan {
  index: number;
  name: string;
  from: string;
  to: string;
  ec: Phase['ec'];
  ph: Phase['ph'];
  waterLevel: Phase['waterLevel'];
  waterTemp: Phase['waterTemp'];
}

/** The plant's phases from `from` to `to` (inclusive), by its own dates (phaseForPlant). */
export function phaseTimeline(calendar: Calendar, dates: PlantDates, from: string, to: string): PhaseSpan[] {
  const spans: PhaseSpan[] = [];
  for (let day = from; daysBetween(day, to) >= 0; day = addDays(day, 1)) {
    const found = phaseForPlant(calendar, dates, day);
    if (!found) continue;
    const last = spans.at(-1);
    if (last && last.index === found.index && addDays(last.to, 1) === day) last.to = day;
    else {
      const p = found.phase;
      spans.push({
        index: found.index,
        name: p.name,
        from: day,
        to: day,
        ec: p.ec,
        ph: p.ph,
        waterLevel: p.waterLevel,
        waterTemp: p.waterTemp,
      });
    }
  }
  return spans;
}

export interface PlantStats {
  /** Days from being placed in the pot to harvest (or today); null when the placing date is unknown. */
  daysInTent: number | null;
  /** Finished feeds, and what they gave. */
  feeds: number;
  waterLiters: number;
  /** mL per supply tank (grow, micro, bloom, ripen, phDown). */
  nutrientMl: Record<string, number>;
  /** Share (0–1) of readings inside the phase's range on their day; null without readings. */
  ecInRange: number | null;
  phInRange: number | null;
  yieldGrams: number | null;
}

export interface PlantStatsInput {
  placedOn: string | null;
  endDay: string;
  timeline: readonly PhaseSpan[];
  feeds: readonly { state: string; batchLiters: number | null; ml: Record<string, number> | null }[];
  /** Readings with their local calendar day. */
  ec: readonly { day: string; value: number }[];
  ph: readonly { day: string; value: number }[];
  yieldGrams: number | null;
}

export function plantStats(input: PlantStatsInput): PlantStats {
  const done = input.feeds.filter((f) => f.state === 'done');
  const nutrientMl: Record<string, number> = {};
  for (const f of done)
    for (const [tank, ml] of Object.entries(f.ml ?? {})) nutrientMl[tank] = round((nutrientMl[tank] ?? 0) + ml);
  const share = (rs: PlantStatsInput['ec'], range: (s: PhaseSpan) => { min: number; max: number }) => {
    let n = 0;
    let ok = 0;
    for (const r of rs) {
      const span = input.timeline.find((s) => r.day >= s.from && r.day <= s.to);
      if (!span) continue;
      n++;
      const { min, max } = range(span);
      if (r.value >= min && r.value <= max) ok++;
    }
    return n ? round(ok / n) : null;
  };
  return {
    daysInTent: input.placedOn ? Math.max(0, daysBetween(input.placedOn, input.endDay)) : null,
    feeds: done.length,
    waterLiters: round(done.reduce((a, f) => a + (f.batchLiters ?? 0), 0)),
    nutrientMl,
    ecInRange: share(input.ec, (s) => s.ec),
    phInRange: share(input.ph, (s) => s.ph),
    yieldGrams: input.yieldGrams,
  };
}

/** At most `n` points: the mean time and value of each run of consecutive readings. */
export function downsample<T extends { at: number; value: number }>(
  rs: readonly T[],
  n: number,
): { at: number; value: number }[] {
  if (rs.length <= n) return rs.map((r) => ({ at: r.at, value: r.value }));
  const out: { at: number; value: number }[] = [];
  for (let b = 0; b < n; b++) {
    const slice = rs.slice(Math.floor((b * rs.length) / n), Math.floor(((b + 1) * rs.length) / n));
    out.push({
      at: Math.round(slice.reduce((a, r) => a + r.at, 0) / slice.length),
      value: round(slice.reduce((a, r) => a + r.value, 0) / slice.length),
    });
  }
  return out;
}

const round = (v: number) => Math.round(v * 1000) / 1000;
