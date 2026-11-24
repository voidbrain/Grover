import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  AgentConfig,
  DEFAULT_CALENDAR,
  PROTOCOL_VERSION,
  computeCorrection,
  configHash,
  firesAt,
  fitCoefficient,
  fitModel,
  freshMix,
  lightWindow,
  localTime,
  parseTopic,
  phaseForDay,
  topics,
  windowActive,
} from '../src/index.ts';

const veg = DEFAULT_CALENDAR.phases[1]!;
const prior = { ecPerMlL: 0.4, phPerMlL: 2, ecSamples: 0, phSamples: 0 };

test('window rules, including one that wraps midnight', () => {
  const day = { kind: 'window', from: '06:00', to: '00:00' } as const;
  assert.equal(windowActive(day, 5 * 60 + 59), false);
  assert.equal(windowActive(day, 6 * 60), true);
  assert.equal(windowActive(day, 23 * 60 + 59), true);
  const night = { kind: 'window', from: '22:00', to: '04:00' } as const;
  assert.equal(windowActive(night, 23 * 60), true);
  assert.equal(windowActive(night, 3 * 60), true);
  assert.equal(windowActive(night, 12 * 60), false);
  assert.deepEqual(lightWindow(18), { kind: 'window', from: '06:00', to: '00:00' });
  assert.deepEqual(lightWindow(12, '08:30'), { kind: 'window', from: '08:30', to: '20:30' });
});

test('point rules fire on their minute only', () => {
  assert.equal(firesAt({ kind: 'every', everyMinutes: 5, durationMs: 0 }, 10), true);
  assert.equal(firesAt({ kind: 'every', everyMinutes: 5, durationMs: 0 }, 11), false);
  assert.equal(firesAt({ kind: 'at', times: ['08:00', '20:00'], durationMs: 1000 }, 20 * 60), true);
  assert.equal(firesAt({ kind: 'window', from: '08:00', to: '09:00' }, 8 * 60), false);
});

test('local time follows the configured zone', () => {
  const at = new Date('2026-06-01T10:15:00Z');
  assert.deepEqual(localTime(at, 'UTC'), { day: '2026-06-01', minuteOfDay: 10 * 60 + 15 });
  assert.deepEqual(localTime(at, 'Europe/Rome'), { day: '2026-06-01', minuteOfDay: 12 * 60 + 15 });
});

test('topics round-trip and reject foreign shapes', () => {
  assert.deepEqual(parseTopic(topics.events('pi-1')), { agentId: 'pi-1', kind: 'events' });
  assert.equal(parseTopic('grover/agents/pi-1/other'), null);
  assert.equal(parseTopic('grover/agents/../events'), null);
});

test('config hash ignores issuedAt and tracks content', () => {
  const base = AgentConfig.parse({
    protocol: PROTOCOL_VERSION,
    agentId: 'pi-1',
    roomId: 'r',
    mode: 'normal',
    probes: [],
    actuators: [],
    schedules: [],
    timezone: 'UTC',
    issuedAt: 1,
  });
  assert.equal(configHash(base), configHash({ ...base, issuedAt: 2 }));
  assert.notEqual(configHash(base), configHash({ ...base, mode: 'off' }));
});

test('fit: no data keeps the prior, clean data moves towards the truth, bad data is ignored', () => {
  assert.equal(fitCoefficient([], 0.4), 0.4);
  const truth = 0.8;
  const samples = Array.from({ length: 30 }, (_, i) => ({ x: 0.5 + i * 0.05, y: truth * (0.5 + i * 0.05) }));
  const k = fitCoefficient(samples, 0.4);
  assert.ok(Math.abs(k - truth) < 0.1, `k=${k}`);
  assert.equal(fitCoefficient([{ x: 1, y: -1 }], 0.4), 0.4);
  const m = fitModel(
    [{ ml: 20, liters: 20, before: 1.0, after: 1.4 }],
    [{ ml: 2, liters: 20, before: 6.4, after: 6.2 }],
  );
  assert.ok(m.ecPerMlL > 0.39 && m.ecPerMlL <= 0.4);
  assert.equal(m.ecSamples, 1);
});

test('correction: nutrients first, in the phase ratio, undershooting the middle', () => {
  const c = computeCorrection({ phase: veg, ec: 1.0, ph: 6.4, liters: 20, model: prior });
  assert.equal(c.ml.phDown, 0, 'pH waits until EC is in range');
  assert.ok(c.ml.grow > c.ml.micro && c.ml.micro > c.ml.bloom);
  const total = c.ml.grow + c.ml.micro + c.ml.bloom;
  const full = ((1.55 - 1.0) / 0.4) * 20;
  assert.ok(total < full && total > full * 0.6, `total=${total} full=${full}`);
});

test('correction: pH down when EC is fine; nothing when in range or flushing; capped', () => {
  const c = computeCorrection({ phase: veg, ec: 1.5, ph: 6.4, liters: 20, model: prior });
  assert.ok(c.ml.phDown > 0 && c.ml.grow === 0);
  assert.equal(computeCorrection({ phase: veg, ec: 1.5, ph: 5.8, liters: 20, model: prior }).reason, 'in range');
  const ripen = DEFAULT_CALENDAR.phases[4]!;
  assert.equal(computeCorrection({ phase: ripen, ec: 0.5, ph: 7, liters: 20, model: prior }).ml.ripen, 0);
  const huge = computeCorrection({ phase: veg, ec: 0, ph: 6, liters: 1000, model: prior, maxMlPerPump: 10 });
  assert.equal(huge.ml.grow, 10);
  const half = computeCorrection({ phase: veg, ec: null, ph: 6.6, liters: 20, model: prior });
  assert.equal(half.ml.phDown, 0, 'no dose without both readings');
  assert.match(half.reason, /needs fresh EC and pH/);
  const high = computeCorrection({ phase: veg, ec: 2.5, ph: 5.0, liters: 20, model: prior });
  assert.match(high.reason, /add water/);
  assert.match(high.reason, /pH-up/);
});

test('phase lookup and fresh mix', () => {
  assert.equal(phaseForDay(DEFAULT_CALENDAR, -1), null);
  assert.equal(phaseForDay(DEFAULT_CALENDAR, 0)?.phase.name, 'Seedling');
  assert.equal(phaseForDay(DEFAULT_CALENDAR, 14)?.phase.name, 'Veg growth');
  assert.equal(phaseForDay(DEFAULT_CALENDAR, 14)?.dayInPhase, 0);
  assert.equal(phaseForDay(DEFAULT_CALENDAR, 112), null);
  assert.deepEqual(freshMix(veg.dose, 20), { grow: 36, micro: 24, bloom: 12, ripen: 0, phDown: 2 });
});
