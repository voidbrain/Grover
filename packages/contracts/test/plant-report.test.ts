import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DEFAULT_CALENDAR,
  Plant,
  addDays,
  downsample,
  localMidnight,
  phaseTimeline,
  plantStats,
} from '../src/index.ts';

const dates = { startedOn: '2026-01-01', bloomOn: '2026-03-01', flushOn: null };

test("phase timeline: the plant's own phases over its days, with the day each starts and ends", () => {
  const spans = phaseTimeline(DEFAULT_CALENDAR, dates, '2026-01-01', '2026-03-20');
  assert.deepEqual(
    spans.map((s) => [s.name, s.from, s.to]),
    [
      ['Seedling', '2026-01-01', '2026-01-14'],
      ['Veg growth', '2026-01-15', '2026-02-28'], // holds in veg until the switch to bloom is recorded
      ['Early bloom', '2026-03-01', '2026-03-14'],
      ['Late bloom', '2026-03-15', '2026-03-20'],
    ],
  );
  assert.deepEqual(phaseTimeline(DEFAULT_CALENDAR, dates, '2025-12-20', '2025-12-31'), [], 'before it started');
  assert.equal(addDays('2026-02-28', 1), '2026-03-01');
});

test('plant statistics: days, feeds, water and nutrients, share of readings in the phase range', () => {
  const timeline = phaseTimeline(DEFAULT_CALENDAR, dates, '2026-01-10', '2026-01-20');
  const seedling = DEFAULT_CALENDAR.phases[0]!;
  const s = plantStats({
    placedOn: '2026-01-10',
    endDay: '2026-01-20',
    timeline,
    feeds: [
      { state: 'done', batchLiters: 2, ml: { grow: 4, micro: 2, phDown: 1 } },
      { state: 'done', batchLiters: 1.5, ml: { grow: 3 } },
      { state: 'refused', batchLiters: null, ml: null },
      { state: 'aborted', batchLiters: 2, ml: { grow: 1 } },
    ],
    ec: [
      { day: '2026-01-11', value: seedling.ec.min },
      { day: '2026-01-11', value: seedling.ec.max + 1 },
      { day: '2025-12-01', value: 9 }, // before the plant was here: not counted
    ],
    ph: [],
    yieldGrams: null,
  });
  assert.equal(s.daysInTent, 10);
  assert.equal(s.feeds, 2, 'finished feeds');
  assert.equal(s.waterLiters, 3.5);
  assert.deepEqual(s.nutrientMl, { grow: 7, micro: 2, phDown: 1 });
  assert.equal(s.ecInRange, 0.5);
  assert.equal(s.phInRange, null, 'no readings');
});

test('downsample keeps the shape: at most n points, averaged per bucket', () => {
  const rs = Array.from({ length: 1000 }, (_, i) => ({ at: i, value: i % 2 }));
  const d = downsample(rs, 100);
  assert.equal(d.length, 100);
  assert.ok(d.every((r) => r.value === 0.5));
  assert.equal(downsample(rs.slice(0, 50), 100).length, 50, 'short series unchanged');
});

test('local midnight of a day in a time zone, across DST', () => {
  assert.equal(new Date(localMidnight('2026-01-15', 'Europe/Rome')).toISOString(), '2026-01-14T23:00:00.000Z');
  assert.equal(new Date(localMidnight('2026-07-15', 'Europe/Rome')).toISOString(), '2026-07-14T22:00:00.000Z');
  assert.equal(
    new Date(localMidnight('2026-03-29', 'Europe/Rome')).toISOString(),
    '2026-03-28T23:00:00.000Z',
    'DST starts at 02:00 that day',
  );
  assert.equal(new Date(localMidnight('2026-01-15', 'Pacific/Auckland')).toISOString(), '2026-01-14T11:00:00.000Z');
  assert.equal(localMidnight('2026-01-15', 'UTC'), Date.parse('2026-01-15T00:00:00Z'));
  assert.equal(
    plantStats({
      placedOn: '2026-01-02',
      endDay: '2026-01-01',
      timeline: [],
      feeds: [],
      ec: [],
      ph: [],
      yieldGrams: null,
    }).daysInTent,
    0,
  );
});

test('a plant is placed in the tent on or after it started, and not after its harvest', () => {
  const base = { id: 'p', name: 'P', startedOn: '2026-01-01' };
  assert.equal(Plant.safeParse({ ...base, placedOn: '2025-12-31' }).success, false);
  assert.equal(Plant.safeParse({ ...base, placedOn: '2026-01-10', harvestedOn: '2026-01-05' }).success, false);
  assert.equal(Plant.safeParse({ ...base, placedOn: '2026-01-10', harvestedOn: '2026-03-01' }).success, true);
});
