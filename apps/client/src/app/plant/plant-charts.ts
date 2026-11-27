import type { FeedView } from '@grover/contracts';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * 🧱 bricks labels a time axis in UTC (bricks 0.5.0 has no option for local time). Moving each instant by the
 * browser's offset at that instant makes those labels read the local wall clock; apply it to every x (points,
 * bands, markers, domain) of one chart.
 */
export const localAxis = (ms: number): number => ms - new Date(ms).getTimezoneOffset() * 60_000;

/** A point's own label (readout, data table): local `yyyy-MM-dd HH:mm`. */
export function localStamp(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** The feed mL keys a dose chart shows, in order: nutrients and pH down; water is the "L given" tile. */
const DOSE_KEYS = ['grow', 'micro', 'bloom', 'ripen', 'phDown'] as const;

/** What finished feeds from `from` to `to` (ms) gave per local day (`MM-DD`), per tank that gave anything. */
export function dosesPerDay(
  feeds: readonly FeedView[],
  from: number,
  to: number,
): { days: string[]; tanks: { key: string; values: number[] }[] } {
  const byDay = new Map<string, Record<string, number>>();
  for (const f of [...feeds].sort((a, b) => a.requestedAt - b.requestedAt)) {
    if (f.state !== 'done' || f.requestedAt < from || f.requestedAt > to) continue;
    const d = new Date(f.requestedAt);
    const day = `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const sums = byDay.get(day) ?? {};
    for (const key of DOSE_KEYS) sums[key] = (sums[key] ?? 0) + (f.ml?.[key] ?? 0);
    byDay.set(day, sums);
  }
  const days = [...byDay.keys()];
  const tanks = DOSE_KEYS.map((key) => ({
    key,
    values: days.map((d) => Math.round(byDay.get(d)![key]! * 10) / 10),
  })).filter((t) => t.values.some((v) => v > 0));
  return { days, tanks };
}
