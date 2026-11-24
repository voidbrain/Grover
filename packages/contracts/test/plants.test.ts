import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Plant, Strain, ancestry, generationLabel, geneticsLabel, lineage } from '../src/index.ts';
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
