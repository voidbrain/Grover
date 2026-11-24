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

/** Local wall-clock parts of `at` in `timeZone`. */
export function localTime(at: Date, timeZone: string): { day: string; minuteOfDay: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
  return {
    day: `${parts['year']}-${parts['month']}-${parts['day']}`,
    minuteOfDay: Number(parts['hour']) * 60 + Number(parts['minute']),
  };
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
