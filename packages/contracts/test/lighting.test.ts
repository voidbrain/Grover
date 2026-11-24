import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEFAULT_CALENDAR, chooseLightPhase, lightRule, type PotPhaseEntry } from '../src/index.ts';

const [seedling, veg, early, late] = DEFAULT_CALENDAR.phases;
const entry = (potId: string, plantId: string | null, index: number, day: number): PotPhaseEntry => ({
  potId,
  plantId,
  phase: DEFAULT_CALENDAR.phases[index]!,
  index,
  day,
});

test('the light follows the picked plant, else the most advanced, else the tent', () => {
  const pots = [entry('p1', 'a', 1, 30), entry('p2', 'b', 3, 10), entry('p3', 'c', 3, 25)];
  const tent = entry('', null, 0, 5);
  assert.equal(chooseLightPhase(pots, null, tent)!.plantId, 'c', 'furthest phase, then most days');
  assert.equal(chooseLightPhase(pots, 'a', tent)!.plantId, 'a', 'the picked plant');
  assert.equal(chooseLightPhase(pots, 'gone', tent)!.plantId, 'c', 'a picked plant no longer in the tent is ignored');
  assert.equal(chooseLightPhase([], null, tent), tent, 'no plants: the tent calendar');
  assert.equal(chooseLightPhase([], null, null), null);
  void seedling;
  void veg;
  void early;
  void late;
});

test('hours become a window from the start time; 0 keeps it dark, 24 keeps it on', () => {
  assert.deepEqual(lightRule(veg!, '06:00'), { kind: 'window', from: '06:00', to: '00:00' });
  assert.deepEqual(lightRule(late!, '07:30'), { kind: 'window', from: '07:30', to: '19:30' });
  assert.deepEqual(lightRule({ ...late!, lightHours: 0 }, '06:00'), { kind: 'dark' });
  assert.deepEqual(lightRule({ ...late!, lightHours: 24 }, '06:00'), { kind: 'window', from: '06:00', to: '06:00' });
});
