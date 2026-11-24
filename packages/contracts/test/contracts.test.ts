import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  AgentConfig,
  DEFAULT_CALENDAR,
  PROTOCOL_VERSION,
  configHash,
  firesAt,
  fitCoefficient,
  fitModel,
  feedReason,
  lightWindow,
  localTime,
  parseTopic,
  phaseForDay,
  planFeed,
  type FeedInput,
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

const pumps: FeedInput['pumps'] = {
  pump_water: { id: 'pump-water', mlPerSecond: 20, maxRunMs: 60_000 },
  pump_grow: { id: 'pump-grow', mlPerSecond: 1.5, maxRunMs: 30_000 },
  pump_micro: { id: 'pump-micro', mlPerSecond: 1.5, maxRunMs: 30_000 },
  pump_bloom: { id: 'pump-bloom', mlPerSecond: 1.5, maxRunMs: 30_000 },
  pump_ripen: { id: 'pump-ripen', mlPerSecond: 1.5, maxRunMs: 30_000 },
  pump_ph_down: { id: 'pump-ph-down', mlPerSecond: 0.5, maxRunMs: 20_000 },
};
const feedInput = (over: Partial<FeedInput> = {}): FeedInput => ({
  feedId: 'f1',
  phase: veg,
  pot: { id: 'pot-1', liters: 15, feedLiters: 2, litersPerCm: 0.5 },
  potLevel: 20,
  ec: 1.5,
  ph: 5.8,
  model: prior,
  pumps,
  transfer: { id: 'pot-1-transfer', mlPerSecond: 25, maxRunMs: 60_000 },
  tankProbes: {
    water: { id: 'tank-water', alertBelow: 5 },
    grow: { id: 'tank-grow', alertBelow: 3 },
    micro: { id: 'tank-micro', alertBelow: 3 },
    bloom: { id: 'tank-bloom', alertBelow: 3 },
    ph_down: { id: 'tank-ph-down', alertBelow: 2 },
    mix: { id: 'tank-mix', alertBelow: null },
  },
  potLevelProbeId: 'pot-1-level',
  mixEmptyLevel: 1,
  settleSeconds: 60,
  ...over,
});

test('feed: the phase dose scaled to the batch, water for the rest, checks on what it uses', () => {
  const d = planFeed(feedInput());
  assert.ok(d.ok);
  assert.equal(d.batchLiters, 2);
  // veg dose per 10 L: grow 18, micro 12, bloom 6, pH down 1
  assert.deepEqual(d.ml, { water: 1993, grow: 3.6, micro: 2.4, bloom: 1.2, ripen: 0, phDown: 0.2 });
  assert.deepEqual(
    d.plan.steps.map((s) => s.tank),
    ['water', 'water', 'grow', 'micro', 'bloom', 'ph_down'],
    'water split at its 60 s cap',
  );
  const checks = d.plan.checks.map((c) => `${c.what}:${c.min ?? ''}:${c.max ?? ''}`);
  assert.deepEqual(checks, ['water:5:', 'grow:3:', 'micro:3:', 'bloom:3:', 'ph_down:2:', 'mix::1', 'pot::90']);
  assert.equal(d.plan.transfer.mixProbeId, 'tank-mix');
  assert.equal(d.plan.transfer.maxMs, Math.round((2000 / 25) * 1000 * 1.5));
  assert.equal(d.plan.settleMs, 60_000);
});

test('feed: long runs are split at the pump cap', () => {
  const d = planFeed(
    feedInput({ pumps: { ...pumps, pump_water: { id: 'pump-water', mlPerSecond: 10, maxRunMs: 60_000 } } }),
  );
  assert.ok(d.ok);
  const water = d.plan.steps.filter((s) => s.tank === 'water');
  assert.deepEqual(
    water.map((s) => s.durationMs),
    [60_000, 60_000, 60_000, 19_300],
  );
});

test('feed: EC and pH adjust the batch', () => {
  const high = planFeed(feedInput({ ec: 2.4 }));
  assert.ok(high.ok);
  assert.equal(high.ml.grow, 0, 'EC above range: water only');
  assert.match(high.notes.join(), /dilute/);
  const low = planFeed(feedInput({ ec: 1.0 }));
  assert.ok(low.ok);
  assert.equal(low.ml.grow, 4.5, '25 % more');
  const acid = planFeed(feedInput({ ph: 6.5 }));
  assert.ok(acid.ok);
  assert.ok(acid.ml.phDown > 1, `pH correction for 17 L: ${acid.ml.phDown}`);
  const sour = planFeed(feedInput({ ph: 5.2 }));
  assert.ok(sour.ok);
  assert.equal(sour.ml.phDown, 0, 'never more pH down below range');
});

test('feed: ripen alone, then plain water when flushing', () => {
  const ripen = planFeed(feedInput({ phase: DEFAULT_CALENDAR.phases[4]!, ec: 2.0 }));
  assert.ok(ripen.ok);
  assert.equal(ripen.ml.ripen, 10);
  assert.equal(ripen.ml.grow + ripen.ml.micro + ripen.ml.bloom, 0);
  const flush = planFeed(feedInput({ phase: DEFAULT_CALENDAR.phases[5]! }));
  assert.ok(flush.ok);
  assert.ok(
    flush.plan.steps.every((s) => s.tank === 'water'),
    'plain water only',
  );
  assert.equal(flush.ml.water, 2000);
});

test('feed: refused when the pot cannot take it or a pump is missing', () => {
  const full = planFeed(feedInput({ potLevel: 90 }));
  assert.equal(full.ok, false);
  assert.match((full as { reason: string }).reason, /pot is full/);
  const nearly = planFeed(feedInput({ potLevel: 89.7 }));
  assert.equal(nearly.ok, false, '0.15 L of room is too little');
  const some = planFeed(feedInput({ potLevel: 88 }));
  assert.ok(some.ok);
  assert.equal(some.batchLiters, 1);
  const noTransfer = planFeed(feedInput({ transfer: null }));
  assert.match((noTransfer as { reason: string }).reason, /no transfer pump/);
  const { pump_grow: _g, ...noGrow } = pumps;
  const missing = planFeed(feedInput({ pumps: noGrow }));
  assert.match((missing as { reason: string }).reason, /no pump_grow pump/);
});

test('feed reasons: low level, low EC, high pH', () => {
  assert.match(feedReason(veg, 5, 1.5, 5.8)!, /level/);
  assert.match(feedReason(veg, 20, 1.0, 5.8)!, /EC/);
  assert.match(feedReason(veg, 20, 1.5, 6.4)!, /pH/);
  assert.equal(feedReason(veg, 20, 1.5, 5.8), null);
  assert.equal(feedReason(DEFAULT_CALENDAR.phases[5]!, 20, 0.1, 5.8), null, 'no EC feeds while flushing');
});

test('phase lookup', () => {
  assert.equal(phaseForDay(DEFAULT_CALENDAR, -1), null);
  assert.equal(phaseForDay(DEFAULT_CALENDAR, 0)?.phase.name, 'Seedling');
  assert.equal(phaseForDay(DEFAULT_CALENDAR, 14)?.phase.name, 'Veg growth');
  assert.equal(phaseForDay(DEFAULT_CALENDAR, 14)?.dayInPhase, 0);
  assert.equal(phaseForDay(DEFAULT_CALENDAR, 112)?.phase.name, 'Flush');
  assert.equal(phaseForDay(DEFAULT_CALENDAR, 118)?.phase.name, 'Flush');
  assert.equal(phaseForDay(DEFAULT_CALENDAR, 119), null);
});
