import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Schedule, isoWeekday, scheduleOnDay } from '../src/index.ts';

// 2026-11-27 is a Friday, 2026-11-28 a Saturday.
const window = { kind: 'window' as const, from: '22:00', to: '06:00' };
const sched = (rule: Schedule['rule'], days: number[] | null) =>
  Schedule.parse({ id: 's', target: { type: 'actuator', actuatorId: 'a' }, rule, enabled: true, days });

test('weekday numbers: Monday 1 to Sunday 7', () => {
  assert.equal(isoWeekday('2026-11-23'), 1);
  assert.equal(isoWeekday('2026-11-27'), 5);
  assert.equal(isoWeekday('2026-11-29'), 7);
});

test('a schedule without days runs every day (configs saved before F-016 parse)', () => {
  const s = Schedule.parse({
    id: 's',
    target: { type: 'probe', probeId: 'p' },
    rule: { kind: 'every', everyMinutes: 5 },
    enabled: true,
  });
  assert.equal(s.days, null);
  assert.equal(scheduleOnDay(s, '2026-11-28', 600), true);
});

test('days limit a rule; a window past midnight belongs to the day it started', () => {
  const fri = sched(window, [5]);
  assert.equal(scheduleOnDay(fri, '2026-11-27', 23 * 60), true, 'Friday 23:00');
  assert.equal(scheduleOnDay(fri, '2026-11-28', 3 * 60), true, 'Saturday 03:00: Friday night');
  assert.equal(scheduleOnDay(fri, '2026-11-28', 23 * 60), false, 'Saturday 23:00');
  assert.equal(scheduleOnDay(fri, '2026-11-27', 3 * 60), false, 'Friday 03:00: Thursday night');
  const weekend = sched({ kind: 'every', everyMinutes: 60, durationMs: 0 }, [6, 7]);
  assert.equal(scheduleOnDay(weekend, '2026-11-28', 600), true);
  assert.equal(scheduleOnDay(weekend, '2026-11-23', 600), false);
});

test('days are 1-7, at least one, each once', () => {
  assert.throws(() => sched(window, []));
  assert.throws(() => sched(window, [0]));
  assert.throws(() => sched(window, [5, 5]));
});
