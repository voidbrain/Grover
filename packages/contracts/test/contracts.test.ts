import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  Actuator,
  AgentConfig,
  DEFAULT_CALENDAR,
  PROTOCOL_VERSION,
  configHash,
  firesAt,
  fitCoefficient,
  fitModel,
  fitPh,
  type FeedSample,
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
const prior = { ecPerMlL: 0.4, phRisePerMlL: 0.05, phDownPerMlL: 2, ecSamples: 0, phSamples: 0 };

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
  assert.deepEqual(fitPh([], 0.05, 2), { a: 0.05, b: 2 });
});

test("fit: the model separates dilution, the nutrients' pH rise and pH down", () => {
  // Feeds generated from known coefficients: k = 0.5, rise a = 0.1, pH down b = 1.5; tap water EC 0.3, pH 7.
  const truth = { k: 0.5, a: 0.1, b: 1.5 };
  const feeds: FeedSample[] = Array.from({ length: 25 }, (_, i) => {
    const v0 = 8 + (i % 5);
    const water = 1 + (i % 3) * 0.5;
    const n = 5 + (i % 7) * 3;
    const p = (i % 4) * 1.5;
    const v1 = v0 + water;
    const ecBefore = 1 + (i % 3) * 0.2;
    const phBefore = 5.8 + (i % 5) * 0.1;
    return {
      v0,
      water,
      nutrientMl: n,
      phDownMl: p,
      waterEc: 0.3,
      waterPh: 7,
      ecBefore,
      ecAfter: (ecBefore * v0 + 0.3 * water) / v1 + (truth.k * n) / v1,
      phBefore,
      phAfter: (phBefore * v0 + 7 * water) / v1 + (truth.a * n - truth.b * p) / v1,
    };
  });
  const m = fitModel(feeds);
  assert.ok(Math.abs(m.ecPerMlL - truth.k) < 0.05, `k=${m.ecPerMlL}`);
  assert.ok(Math.abs(m.phRisePerMlL - truth.a) < 0.03, `a=${m.phRisePerMlL}`);
  assert.ok(Math.abs(m.phDownPerMlL - truth.b) < 0.2, `b=${m.phDownPerMlL}`);
  assert.equal(m.ecSamples, 25);
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
  ec: 1.0,
  ph: 6.2,
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
  waterEc: 0.3,
  waterPh: 7,
  ...over,
});

const near = (actual: number | null, expected: number, tol: number, what: string) =>
  assert.ok(actual !== null && Math.abs(actual - expected) <= tol, `${what}: ${actual}, expected about ${expected}`);
const total = (ml: Record<string, number>) => ml['grow']! + ml['micro']! + ml['bloom']! + ml['ripen']!;

test('feed: nutrients bring EC to the middle of the range after the water dilutes it', () => {
  // Pot at 20 cm × 0.5 L/cm = 10 L, room for 35 L but one batch is 2 L. Veg EC 1.3–1.8 → 1.55.
  // After 2 L of tap water (EC 0.3): (1.0·10 + 0.3·2) / 12 = 0.883; nutrients (1.55 − 0.883) · 12 / 0.4 = 20 mL.
  const d = planFeed(feedInput());
  assert.ok(d.ok, JSON.stringify(d));
  assert.equal(d.batchLiters, 2);
  assert.equal(d.potLitersBefore, 10);
  near(total(d.ml), 20, 0.3, 'nutrient mL');
  assert.deepEqual([d.ml.grow, d.ml.micro, d.ml.bloom, d.ml.ripen], [10, 6.7, 3.3, 0], 'veg ratio 18:12:6');
  near(d.expected.ec, 1.55, 0.02, 'expected EC');
});

test('feed: pH down is worked out after the nutrients raise pH', () => {
  // Expected before pH down: (6.2·10 + 7·2) / 12 + 0.05 · 20 / 12 = 6.417; to 5.75: (6.417 − 5.75) · 12 / 2 = 4 mL.
  const d = planFeed(feedInput());
  assert.ok(d.ok);
  near(d.ml.phDown, 4, 0.15, 'pH down mL');
  near(d.expected.ph, 5.75, 0.03, 'expected pH');
  const low = planFeed(feedInput({ ph: 5.0, ec: 1.55 }));
  assert.ok(low.ok);
  assert.equal(low.ml.phDown, 0, 'already below target after mixing: no pH down');
});

test('feed: water goes in portions between the additives, pH down last', () => {
  const d = planFeed(feedInput());
  assert.ok(d.ok);
  assert.deepEqual(
    d.plan.steps.map((s) => s.tank),
    ['water', 'grow', 'water', 'micro', 'water', 'bloom', 'water', 'ph_down', 'water'],
  );
  const water = d.plan.steps.filter((s) => s.tank === 'water').reduce((a, s) => a + s.ml, 0);
  near(water, d.ml.water, 1, 'water portions add up');
  const checks = d.plan.checks.map((c) => `${c.what}:${c.min ?? ''}:${c.max ?? ''}`);
  assert.deepEqual(checks, ['water:5:', 'grow:3:', 'micro:3:', 'bloom:3:', 'ph_down:2:', 'mix::1', 'pot::90']);
  assert.equal(d.plan.transfer.mixProbeId, 'tank-mix');
  assert.equal(d.plan.settleMs, 60_000);
});

test('feed: water follows the level, and dilutes when EC is high', () => {
  const bigBatch = { id: 'pot-1', liters: 15, feedLiters: 50, litersPerCm: 0.5 };
  const topUp = planFeed(feedInput({ pot: bigBatch, potLevel: 80, ec: 1.55, ph: 5.75 }));
  assert.ok(topUp.ok);
  assert.equal(topUp.batchLiters, 5, 'up to the phase maximum: (90 − 80) · 0.5');
  // Topping up 35 L of tap water dilutes EC 2.4 well below target, so nutrients bring it back to the middle.
  const high = planFeed(feedInput({ pot: bigBatch, potLevel: 20, ec: 2.4, ph: 5.75 }));
  assert.ok(high.ok);
  assert.equal(high.batchLiters, 35);
  near(high.expected.ec, 1.55, 0.02, 'diluted, then back to target');
  // With one 2 L batch the water cannot dilute enough: no nutrients at all.
  const capped = planFeed(feedInput({ potLevel: 20, ec: 2.4, ph: 5.75 }));
  assert.ok(capped.ok);
  assert.equal(capped.batchLiters, 2);
  assert.equal(total(capped.ml), 0, 'no nutrients while EC stays above target');
  assert.match(capped.notes.join(), /dilute/);
  assert.match(capped.notes.join(), /limited to 2 L/);
});

test('feed: without a level only a small carrier batch; without EC the phase dose', () => {
  const noLevel = planFeed(feedInput({ potLevel: null, potLevelProbeId: null }));
  assert.ok(noLevel.ok);
  assert.equal(noLevel.batchLiters, 0.5, '0.1 L with each of 4 additives, plus one');
  assert.match(noLevel.notes.join(), /no pot level/);
  const noEc = planFeed(feedInput({ ec: null }));
  assert.ok(noEc.ok);
  near(total(noEc.ml), 7.2, 0.05, 'veg dose 36 mL per 10 L, for 2 L');
});

test('feed: ripen alone, plain water while flushing, long runs split at the pump cap', () => {
  const ripen = planFeed(feedInput({ phase: DEFAULT_CALENDAR.phases[4]! }));
  assert.ok(ripen.ok);
  assert.ok(ripen.ml.ripen > 0);
  assert.equal(ripen.ml.grow + ripen.ml.micro + ripen.ml.bloom, 0);
  const flush = planFeed(feedInput({ phase: DEFAULT_CALENDAR.phases[5]! }));
  assert.ok(flush.ok);
  assert.ok(
    flush.plan.steps.every((s) => s.tank === 'water'),
    'plain water only',
  );
  const slow = planFeed(
    feedInput({
      pumps: { ...pumps, pump_water: { id: 'pump-water', mlPerSecond: 5, maxRunMs: 60_000 } },
      ec: 1.55,
      ph: 5.75,
    }),
  );
  assert.ok(slow.ok);
  assert.ok(slow.plan.steps.filter((s) => s.tank === 'water').every((s) => s.durationMs <= 60_000));
});

test('feed: refused when the pot is full, cannot carry the additives, or a pump is missing', () => {
  const full = planFeed(feedInput({ potLevel: 90 }));
  assert.match((full as { reason: string }).reason, /pot is full/);
  const tight = planFeed(feedInput({ potLevel: 89.7 }));
  assert.match((tight as { reason: string }).reason, /not enough to carry/);
  const blind = planFeed(feedInput({ potLevel: null, potLevelProbeId: null, ec: null, ph: null }));
  assert.match((blind as { reason: string }).reason, /no fresh readings/);
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

test('a pump must have a run cap; a switch need not', () => {
  const base = {
    id: 'p',
    roomId: 'r',
    potId: null,
    name: 'P',
    enabled: true,
    binding: { driver: 'mock' },
    mlPerSecond: 1,
  };
  assert.equal(Actuator.safeParse({ ...base, kind: 'pump_grow', maxRunMs: 0 }).success, false);
  assert.equal(Actuator.safeParse({ ...base, kind: 'pump_grow', maxRunMs: 30_000 }).success, true);
  assert.equal(Actuator.safeParse({ ...base, kind: 'light', maxRunMs: 0, mlPerSecond: null }).success, true);
});

test('feed: a negative level reading (noise, uncalibrated probe) cannot make volumes negative', () => {
  const d = planFeed(feedInput({ potLevel: -4 }));
  assert.ok(d.ok);
  assert.ok(d.potLitersBefore >= 0);
  assert.ok(
    Object.values(d.ml).every((v) => Number.isFinite(v) && v >= 0),
    JSON.stringify(d.ml),
  );
});

test('an L298N binding (F-018): pumps only, three distinct pins', () => {
  const base = {
    id: 'p',
    roomId: 'r',
    potId: null,
    kind: 'pump_grow',
    name: 'P',
    enabled: true,
    maxRunMs: 30_000,
    mlPerSecond: null,
  };
  const l298n = { driver: 'l298n', i2cBus: 1, i2cAddress: 0x20, in1: 4, in2: 5, enable: 6 };
  assert.equal(Actuator.safeParse({ ...base, binding: l298n }).success, true);
  assert.equal(Actuator.safeParse({ ...base, binding: { ...l298n, enable: null } }).success, true);
  assert.equal(Actuator.safeParse({ ...base, binding: { ...l298n, in2: 4 } }).success, false, 'IN1 and IN2 apart');
  assert.equal(Actuator.safeParse({ ...base, binding: { ...l298n, enable: 5 } }).success, false, 'enable apart');
  assert.equal(
    Actuator.safeParse({ ...base, kind: 'light', maxRunMs: 0, binding: l298n }).success,
    false,
    'a light is a relay',
  );
});

test('no two actuators drive the same pin (review of #29)', () => {
  const pumpOn = (id: string, binding: object) => ({
    id,
    roomId: 'r',
    potId: null,
    kind: 'pump_grow',
    name: id,
    enabled: true,
    maxRunMs: 30_000,
    mlPerSecond: null,
    binding,
  });
  const config = (actuators: object[]) => ({
    protocol: PROTOCOL_VERSION,
    agentId: 'pi-1',
    roomId: 'r',
    mode: 'normal',
    timezone: 'UTC',
    issuedAt: 1,
    probes: [],
    actuators,
    schedules: [],
  });
  const a = pumpOn('a', { driver: 'l298n', i2cBus: 1, i2cAddress: 0x20, in1: 4, in2: 5, enable: null });
  const relayOnIn2 = {
    ...pumpOn('r', { driver: 'mcp23017', i2cBus: 1, i2cAddress: 0x20, pin: 5, activeLow: true }),
    kind: 'light',
    maxRunMs: 0,
  };
  const otherChip = {
    ...relayOnIn2,
    binding: { driver: 'mcp23017', i2cBus: 1, i2cAddress: 0x21, pin: 5, activeLow: true },
  };
  assert.equal(AgentConfig.safeParse(config([a, relayOnIn2])).success, false, 'a relay on the bridge IN2');
  assert.equal(
    AgentConfig.safeParse(
      config([a, pumpOn('b', { driver: 'l298n', i2cBus: 1, i2cAddress: 0x20, in1: 5, in2: 6, enable: null })]),
    ).success,
    false,
  );
  assert.equal(AgentConfig.safeParse(config([a, otherChip])).success, true, 'another expander');
});
