import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DEFAULT_CALENDAR,
  daysBetween,
  Plant,
  Strain,
  ancestry,
  generationLabel,
  geneticsLabel,
  lineage,
  phaseForPlant,
} from '../src/index.ts';
import { slugify } from '../src/kinds.ts';

const strain = (id: string, parentIds: string[] = []) => Strain.parse({ id, name: id, parentIds });
const plant = (id: string, motherId: string | null, generation: number) =>
  Plant.parse({ id, name: id, motherId, generation });

test('plant rules: a seedling has no mother, no plant is its own mother', () => {
  assert.equal(Plant.safeParse({ id: 'a', name: 'A', generation: 0, motherId: 'b' }).success, false);
  assert.equal(Plant.safeParse({ id: 'a', name: 'A', generation: 1, motherId: 'a' }).success, false);
  assert.equal(Plant.safeParse({ id: 'a', name: 'A', generation: 2, motherId: 'b' }).success, true);
  assert.equal(Plant.safeParse({ id: 'a', name: 'A', startedOn: '24/11/2026' }).success, false, 'dates are YYYY-MM-DD');
});

test('labels', () => {
  assert.equal(geneticsLabel(70), '70 % sativa / 30 % indica');
  assert.equal(geneticsLabel(null), null);
  assert.deepEqual([0, 1, 2, 3, 4, 11, 12, 13, 21, 22].map(generationLabel), [
    'from seed',
    '1st cutting',
    '2nd cutting',
    '3rd cutting',
    '4th cutting',
    '11th cutting',
    '12th cutting',
    '13th cutting',
    '21st cutting',
    '22nd cutting',
  ]);
  assert.equal(slugify('Northern Lights #5 x Haze'), 'northern-lights-5-x-haze');
  assert.equal(slugify('!!'), 'item');
});

test('ancestry: parents of parents, cut at a depth, safe against loops', () => {
  const strains = [
    strain('cross', ['nl5', 'haze']),
    strain('nl5', ['afghani']),
    strain('haze'),
    strain('afghani'),
    strain('loop', ['loop2']),
    strain('loop2', ['loop']),
  ];
  const tree = ancestry('cross', strains)!;
  assert.deepEqual(
    tree.parents.map((p) => p.strain.id),
    ['nl5', 'haze'],
  );
  assert.equal(tree.parents[0]!.parents[0]!.strain.id, 'afghani');
  assert.equal(ancestry('cross', strains, 1)!.parents[0]!.parents.length, 0);
  const loop = ancestry('loop', strains)!;
  assert.equal(loop.parents[0]!.parents.length, 0, 'the loop stops');
});

test('lineage: the line of mothers, newest first, safe against loops', () => {
  const plants = [plant('seedling', null, 0), plant('cut1', 'seedling', 1), plant('cut2', 'cut1', 2)];
  assert.deepEqual(
    lineage('cut2', plants).map((p) => p.id),
    ['cut1', 'seedling'],
  );
  const looped = [plant('x', 'y', 1), plant('y', 'x', 1)];
  assert.deepEqual(
    lineage('x', looped).map((p) => p.id),
    ['y'],
  );
});

test('phase per plant: veg from its start (holding until bloom), bloom from its bloom date, then flush', () => {
  // phaseForPlant takes today's calendar date in the grow's time zone.
  const at = (iso: string) => iso;
  const p = (startedOn: string, bloomOn: string | null = null, flushOn: string | null = null) => ({
    startedOn,
    bloomOn,
    flushOn,
  });
  const name = (r: ReturnType<typeof phaseForPlant>) => r?.phase.name ?? null;
  // Default calendar: Seedling 14, Veg 28 | Early bloom 14, Late bloom 42, Ripen 14 | Flush 7.
  assert.equal(name(phaseForPlant(DEFAULT_CALENDAR, p('2026-11-01'), at('2026-11-05'))), 'Seedling');
  assert.equal(name(phaseForPlant(DEFAULT_CALENDAR, p('2026-11-01'), at('2026-11-20'))), 'Veg growth');
  const waiting = phaseForPlant(DEFAULT_CALENDAR, p('2026-11-01'), at('2027-01-30'));
  assert.equal(name(waiting), 'Veg growth', 'holds in veg until the switch to bloom is recorded');
  assert.equal(waiting!.day, 90);
  assert.equal(name(phaseForPlant(DEFAULT_CALENDAR, p('2026-11-01', '2026-12-20'), at('2026-12-25'))), 'Early bloom');
  assert.equal(name(phaseForPlant(DEFAULT_CALENDAR, p('2026-11-01', '2026-12-20'), at('2027-01-10'))), 'Late bloom');
  assert.equal(name(phaseForPlant(DEFAULT_CALENDAR, p('2026-11-01', '2026-12-20'), at('2027-02-25'))), 'Ripen');
  assert.equal(
    name(phaseForPlant(DEFAULT_CALENDAR, p('2026-11-01', '2026-12-20'), at('2027-03-12'))),
    'Flush',
    'on into flush',
  );
  assert.equal(
    name(phaseForPlant(DEFAULT_CALENDAR, p('2026-11-01', '2026-12-20', '2027-01-15'), at('2027-01-16'))),
    'Flush',
  );
  assert.equal(
    phaseForPlant(DEFAULT_CALENDAR, { startedOn: null, bloomOn: null, flushOn: null }, at('2026-11-05')),
    null,
  );
  assert.equal(phaseForPlant(DEFAULT_CALENDAR, p('2026-12-01'), at('2026-11-05')), null, 'not started yet');
});

test('flushing on a calendar without a flush phase holds in the last flowering phase', () => {
  const noFlush = { ...DEFAULT_CALENDAR, phases: DEFAULT_CALENDAR.phases.filter((ph) => !ph.flushing) };
  const r = phaseForPlant(
    noFlush,
    { startedOn: '2026-01-01', bloomOn: '2026-02-01', flushOn: '2026-03-01' },
    '2026-03-05',
  );
  assert.equal(r?.phase.name, 'Ripen');
});

test("days are counted on calendar dates in the grow's time zone", () => {
  assert.equal(daysBetween('2026-11-24', '2026-11-24'), 0);
  assert.equal(daysBetween('2026-11-24', '2026-11-25'), 1);
  assert.equal(daysBetween('2026-03-28', '2026-03-30'), 2, 'across a DST change');
  assert.equal(daysBetween('2026-11-25', '2026-11-24'), -1);
});
