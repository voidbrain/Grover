import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Actuator, FeedPlan, Probe } from '@grover/contracts';
import { Actuators } from '../src/actuators.ts';
import { MockDrivers, MockWorld } from '../src/drivers/mock.ts';
import { FeedRunner, type FeedState } from '../src/feed.ts';

// Fast pumps so a feed takes milliseconds: mL per second is high, durations are short.
const pump = (id: string, kind: Actuator['kind'], potId: string | null = null): Actuator => ({
  id,
  roomId: 'r',
  potId,
  kind,
  name: id,
  enabled: true,
  binding: { driver: 'mock' },
  maxRunMs: 1000,
  mlPerSecond: 10_000,
});
const level = (
  id: string,
  tank: Probe['tank'],
  potId: string | null = null,
): Pick<Probe, 'kind' | 'potId' | 'tank'> & { id: string } => ({
  id,
  kind: 'water_level',
  potId,
  tank,
});

async function rig() {
  const world = new MockWorld();
  const drivers = new MockDrivers(world);
  const acts = new Actuators(() => {});
  const list = [
    pump('pump-water', 'pump_water'),
    pump('pump-grow', 'pump_grow'),
    pump('pot-1-transfer', 'pump_transfer', 'pot-1'),
    { ...pump('light', 'light'), maxRunMs: 0, mlPerSecond: null },
  ];
  await acts.load(
    await Promise.all(list.map(async (actuator) => ({ actuator, driver: await drivers.actuator(actuator) }))),
  );
  const probes = new Map(
    [
      level('tank-water', 'water'),
      level('tank-grow', 'grow'),
      level('tank-mix', 'mix'),
      level('pot-1-level', null, 'pot-1'),
    ].map((p) => [p.id, p]),
  );
  const reports: { state: FeedState; message: string }[] = [];
  const runner = new FeedRunner({
    actuators: acts,
    read: async (id) => world.read(probes.get(id)!),
    report: (_f, _p, state, message) => reports.push({ state, message }),
    sleep: async (_ms, cancelled) => !cancelled(),
  });
  return { world, acts, runner, reports, drivers };
}

const plan = (over: Partial<FeedPlan> = {}): FeedPlan => ({
  feedId: 'f1',
  potId: 'pot-1',
  // 1.5 L of water and 3 mL of grow into the mixing tank
  steps: [
    { actuatorId: 'pump-water', tank: 'water', ml: 1500, durationMs: 150 },
    { actuatorId: 'pump-grow', tank: 'grow', ml: 100, durationMs: 10 },
  ],
  checks: [
    { probeId: 'tank-water', what: 'water', min: 5, max: null },
    { probeId: 'tank-grow', what: 'grow', min: 3, max: null },
    { probeId: 'tank-mix', what: 'mix', min: null, max: 1 },
    { probeId: 'pot-1-level', what: 'pot', min: null, max: 90 },
  ],
  settleMs: 10,
  transfer: {
    actuatorId: 'pot-1-transfer',
    maxMs: 2000,
    sliceMs: 20,
    mixProbeId: 'tank-mix',
    mixEmptyLevel: 1,
    potProbeId: 'pot-1-level',
    potMaxLevel: 90,
  },
  ...over,
});

test('a feed mixes, settles and empties the mixing tank into the pot', async () => {
  const { world, runner, reports, drivers } = await rig();
  const potBefore = world.pot('pot-1').liters;
  await runner.start(plan());
  assert.equal(reports.at(-1)!.state, 'done', JSON.stringify(reports));
  assert.match(reports.at(-1)!.message, /mixing tank empty/);
  assert.ok(world.mix.liters <= 0.2, `mix left: ${world.mix.liters}`);
  assert.ok(world.pot('pot-1').liters > potBefore + 1, 'the batch reached the pot');
  assert.ok(world.pot('pot-1').nutrientMl > 20, 'with its nutrients');
  assert.ok(
    [...drivers.states.values()].every((on) => !on),
    'everything off at the end',
  );
  assert.equal(runner.busy, null);
});

test('refused before anything runs when a supply tank is low', async () => {
  const { world, runner, reports, drivers } = await rig();
  world.supply.grow = 0.1; // 2 cm, below the 3 cm alert
  await runner.start(plan());
  assert.equal(reports.at(-1)!.state, 'aborted');
  assert.match(reports.at(-1)!.message, /grow tank low/);
  assert.equal(world.supply.water, 50, 'no water was pumped');
  assert.ok([...drivers.states.values()].every((on) => !on));
});

test('refused when the mixing tank is not empty or the pot is full', async () => {
  const a = await rig();
  a.world.mix.liters = 1;
  await a.runner.start(plan());
  assert.match(a.reports.at(-1)!.message, /mixing tank not empty/);

  const b = await rig();
  b.world.pot('pot-1').liters = 46; // 92 cm
  await b.runner.start(plan());
  assert.match(b.reports.at(-1)!.message, /pot too full/);
});

test('the transfer stops when the pot is full, leaving the rest in the mixing tank', async () => {
  const { world, runner, reports } = await rig();
  world.pot('pot-1').liters = 44.6; // 89.2 cm: room for about 0.4 L
  await runner.start(plan());
  assert.equal(reports.at(-1)!.state, 'done');
  assert.match(reports.at(-1)!.message, /pot full/);
  assert.ok(world.mix.liters > 0.5, 'the rest stays in the mixing tank (the next feed is refused until it is emptied)');
});

test('cancel stops the feed with everything off; one feed at a time', async () => {
  const { runner, reports, acts, drivers } = await rig();
  const running = runner.start(
    plan({ steps: [{ actuatorId: 'pump-water', tank: 'water', ml: 10_000, durationMs: 1000 }] }),
  );
  assert.throws(() => runner.start(plan({ feedId: 'f2' })), /still running/);
  await new Promise((r) => setTimeout(r, 30));
  runner.cancel('stopped');
  await acts.allOff('manual');
  await running;
  assert.equal(reports.at(-1)!.state, 'aborted');
  assert.equal(reports.at(-1)!.message, 'stopped');
  assert.ok([...drivers.states.values()].every((on) => !on));
  assert.equal(runner.busy, null);
});

test('a plan naming a pump the agent does not have is refused at once', async () => {
  const { runner } = await rig();
  assert.throws(
    () => runner.start(plan({ transfer: { ...plan().transfer, actuatorId: 'nope' } })),
    /unknown transfer pump/,
  );
});

test('Stop all during a tank re-check: the next pump does not start', async () => {
  const { runner, reports, acts, drivers, world } = await rig();
  // The grow re-check reading takes a while; Stop all lands in the middle of it.
  let slowGrow = false;
  const probes = new Map([
    ['tank-water', { kind: 'water_level' as const, potId: null, tank: 'water' as const }],
    ['tank-grow', { kind: 'water_level' as const, potId: null, tank: 'grow' as const }],
    ['tank-mix', { kind: 'water_level' as const, potId: null, tank: 'mix' as const }],
    ['pot-1-level', { kind: 'water_level' as const, potId: 'pot-1', tank: null }],
  ]);
  const slowRunner = new FeedRunner({
    actuators: acts,
    read: async (id) => {
      if (id === 'tank-grow' && slowGrow) await new Promise((r) => setTimeout(r, 50));
      return world.read(probes.get(id)!);
    },
    report: (_f, _p, state, message) => reports.push({ state, message }),
    sleep: async (_ms, cancelled) => !cancelled(),
  });
  void runner;
  const running = slowRunner.start(plan());
  await new Promise((r) => setTimeout(r, 5));
  slowGrow = true; // first checks done; the re-check before the grow step is slow
  await new Promise((r) => setTimeout(r, 160)); // water step (150 ms) finishes, grow re-check starts
  slowRunner.cancel('stopped with Stop all');
  await acts.allOff('manual');
  await running;
  assert.equal(reports.at(-1)!.state, 'aborted');
  assert.equal(world.supply.grow, 1, 'no grow was pumped after the stop');
  assert.ok([...drivers.states.values()].every((on) => !on));
});

test('an aborted feed stops the pumps but leaves lights, fans and loops alone', async () => {
  const { runner, reports, acts, world } = await rig();
  await acts.switch('light', true, 'schedule');
  world.supply.grow = 0.1; // low: the feed aborts at its first check
  await runner.start(plan());
  assert.equal(reports.at(-1)!.state, 'aborted');
  assert.equal(acts.isOn('light'), true, 'the light stays on');
});
