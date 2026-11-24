import type { ScheduleRule } from './domain.ts';

/** Minutes since local midnight for "HH:MM". */
export function parseHHMM(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h! * 60 + m!;
}

export function formatHHMM(minuteOfDay: number): string {
  const m = ((minuteOfDay % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/** One formatter per time zone: making one costs far more than using it (a report reads thousands of times). */
const formatters = new Map<string, Intl.DateTimeFormat>();
function formatter(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    formatters.set(timeZone, f);
  }
  return f;
}

/** Local wall-clock parts of `at` in `timeZone`. */
export function localTime(at: Date, timeZone: string): { day: string; minuteOfDay: number } {
  const parts = Object.fromEntries(
    formatter(timeZone)
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
  return {
    day: `${parts['year']}-${parts['month']}-${parts['day']}`,
    minuteOfDay: Number(parts['hour']) * 60 + Number(parts['minute']),
  };
}

/**
 * The instant local midnight starts `day` (YYYY-MM-DD) in `timeZone`, in ms. Found by correcting a guess with the
 * zone's offset (twice, for a DST change near midnight); a zone that skips midnight gets the first minute after it.
 */
export function localMidnight(day: string, timeZone: string): number {
  const target = Date.parse(`${day}T00:00:00Z`);
  let t = target;
  for (let i = 0; i < 3; i++) {
    const l = localTime(new Date(t), timeZone);
    const offsetMin = (Date.parse(`${l.day}T00:00:00Z`) - target) / 60_000 + l.minuteOfDay;
    if (offsetMin === 0) return t;
    t -= offsetMin * 60_000;
  }
  // Midnight was skipped (clocks jump from 00:00 to 01:00): `t` is still on the day before; the day starts at the
  // end of that day's last local hour.
  const l = localTime(new Date(t), timeZone);
  if (l.day < day) t += (1440 - l.minuteOfDay) * 60_000;
  return t;
}

/** Is a window rule "on" at this minute? `to` is exclusive; a window that wraps midnight is supported. */
export function windowActive(rule: Extract<ScheduleRule, { kind: 'window' }>, minuteOfDay: number): boolean {
  const from = parseHHMM(rule.from);
  const to = parseHHMM(rule.to);
  if (from === to) return true; // 24h
  return from < to ? minuteOfDay >= from && minuteOfDay < to : minuteOfDay >= from || minuteOfDay < to;
}

/** Does a point-in-time rule fire at this minute? Window rules never "fire"; they hold a state. */
export function firesAt(rule: ScheduleRule, minuteOfDay: number): boolean {
  switch (rule.kind) {
    case 'window':
    case 'dark':
      return false;
    case 'at':
      return rule.times.some((t) => parseHHMM(t) === minuteOfDay);
    case 'every':
      return minuteOfDay % rule.everyMinutes === 0;
  }
}

/** A light window of `hours` starting at `startsAt` (default 06:00). */
export function lightWindow(hours: number, startsAt = '06:00'): Extract<ScheduleRule, { kind: 'window' }> {
  const from = parseHHMM(startsAt);
  return { kind: 'window', from: formatHHMM(from), to: formatHHMM(from + Math.round(hours * 60)) };
}
