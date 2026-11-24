import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Actuation, Actuator } from '@grover/contracts';
import { Actuators } from '../src/actuators.ts';

const pump = (id: string, maxRunMs = 200): Actuator => ({
  id,
  roomId: 'r',
  potId: null,
  kind: 'pump_grow',
  name: id,
  enabled: true,
  binding: { driver: 'mock' },
  maxRunMs,
  mlPerSecond: 1,
});
const light: Actuator = {
  id: 'light',
  roomId: 'r',
  potId: null,
  kind: 'light',
  name: 'light',
  enabled: true,
  binding: { driver: 'mock' },
  maxRunMs: 0,
  mlPerSecond: null,
};

function rig() {
  const events: Actuation[] = [];
  const pins = new Map<string, boolean>();
  const acts = new Actuators((a) => events.push(a));
  const driver = (id: string) => ({ set: async (on: boolean) => void pins.set(id, on) });
  return {
    events,
    pins,
    acts,
    load: (list: Actuator[]) => acts.load(list.map((actuator) => ({ actuator, driver: driver(actuator.id) }))),
  };
}

test('a run is clamped to the pump cap and switches off on its own', async () => {
  const { acts, events, pins, load } = rig();
  await load([pump('a', 50)]);
  const { durationMs, done } = acts.run('a', 10_000, 'manual');
  assert.equal(durationMs, 50);
  await done;
  assert.equal(pins.get('a'), false);
  assert.deepEqual(
    events.map((e) => e.state),
    ['on', 'off'],
  );
  assert.ok(events[1]!.ranMs! >= 45 && events[1]!.ranMs! < 1000);
});

test('pumps run one at a time', async () => {
  const { acts, pins, load } = rig();
  await load([pump('a', 60), pump('b', 60)]);
  const a = acts.run('a', 60, 'manual');
  const b = acts.run('b', 60, 'manual');
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(pins.get('a'), true);
  assert.equal(pins.get('b'), false);
  await a.done;
  await new Promise((r) => setTimeout(r, 10));
  assert.equal(pins.get('b'), true);
  await b.done;
});

// Requirement changed on 2026-11-24 (review of #15-#17, finding 1): Stop all is an emergency stop, so runs still
// waiting in the queue are dropped, not started once the queue frees up. The queue still settles every waiter.
test('stop drops queued runs: nothing switches on after Stop all', async () => {
  const { acts, pins, load, events } = rig();
  await load([pump('a', 10_000), pump('b', 400)]);
  const a = acts.run('a', 10_000, 'manual');
  const b = acts.run('b', 400, 'manual');
  await new Promise((r) => setTimeout(r, 10));
  await acts.allOff('manual');
  assert.equal(await a.done, true, 'a ran (and was stopped)');
  assert.equal(await b.done, false, 'b never started');
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(pins.get('b'), false);
  assert.ok(!events.some((e) => e.actuatorId === 'b'), 'no event for b at all');
});

test('a stop that arrives while a relay is still switching on wins', async () => {
  const events: Actuation[] = [];
  const acts = new Actuators((a) => events.push(a));
  let pin = false;
  // set(true) takes 50 ms, like pinctrl spawning a process.
  const slow = {
    set: async (on: boolean) => {
      if (on) await new Promise((r) => setTimeout(r, 50));
      pin = on;
    },
  };
  await acts.load([{ actuator: pump('a', 10_000), driver: slow }]);
  const run = acts.run('a', 5_000, 'manual');
  await new Promise((r) => setTimeout(r, 10));
  await acts.allOff('manual');
  assert.equal(await run.done, false);
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(pin, false, 'the relay is off once set(true) returns');
  assert.deepEqual(acts.active(), []);
});

test('a pump without a cap does not run', async () => {
  const { acts, load } = rig();
  await load([pump('a', 0)]);
  assert.throws(() => acts.run('a', 86_400_000, 'manual'), /no run cap/);
});

test('a switch-off that fails stays "on" and the watchdog keeps trying', async () => {
  const events: Actuation[] = [];
  const acts = new Actuators((a) => events.push(a));
  let fail = true;
  let pin = false;
  const flaky = {
    set: async (on: boolean) => {
      if (!on && fail) throw new Error('i2c error');
      pin = on;
    },
  };
  await acts.load([{ actuator: light, driver: flaky }]).catch(() => {});
  fail = false;
  await acts.switch('light', true, 'manual');
  fail = true;
  await acts.switch('light', false, 'manual');
  assert.equal(pin, true);
  assert.deepEqual(acts.active(), ['light'], 'still reported on');
  fail = false;
  await acts.watchdog();
  assert.equal(pin, false);
  assert.deepEqual(acts.active(), []);
  assert.equal(events.at(-1)!.state, 'off');
});

test('pumps cannot be switched on; switches can', async () => {
  const { acts, pins, load } = rig();
  await load([pump('a'), light]);
  await assert.rejects(acts.switch('a', true, 'manual'), /bounded run/);
  await acts.switch('light', true, 'manual');
  assert.equal(pins.get('light'), true);
  assert.throws(() => acts.run('light', 100, 'manual'), /not a pump/);
});

test('reloading the config turns everything off and drops queued runs', async () => {
  const { acts, pins, load } = rig();
  await load([pump('a', 10_000), pump('b', 10_000), light]);
  await acts.switch('light', true, 'manual');
  const a = acts.run('a', 10_000, 'manual');
  const b = acts.run('b', 10_000, 'manual');
  await new Promise((r) => setTimeout(r, 10));
  await load([pump('a'), pump('b'), light]);
  await a.done;
  await b.done;
  assert.equal(pins.get('light'), false);
  assert.equal(pins.get('b'), false, 'queued run on the old config never started');
});

test('the watchdog forces off a pump past its cap', async () => {
  let now = 0;
  const events: Actuation[] = [];
  const acts = new Actuators(
    (a) => events.push(a),
    () => now,
  );
  let pin = false;
  await acts.load([{ actuator: pump('a', 100), driver: { set: async (on) => void (pin = on) } }]);
  acts.run('a', 100, 'manual');
  await new Promise((r) => setTimeout(r, 5));
  assert.equal(pin, true);
  now = 5_000; // the clock moved on but the timer did not fire yet
  assert.deepEqual(await acts.watchdog(), ['a']);
  assert.equal(pin, false);
  assert.equal(events.at(-1)!.source, 'safety');
});

test('a pump whose relay will not switch off: its run settles, and no other pump runs until it does', async () => {
  const acts = new Actuators(() => {});
  let failOff = false;
  const pins = new Map<string, boolean>();
  const driver = (id: string) => ({
    set: async (on: boolean) => {
      if (!on && failOff && id === 'a') throw new Error('i2c error');
      pins.set(id, on);
    },
  });
  await acts.load([pump('a', 40), pump('b', 40)].map((actuator) => ({ actuator, driver: driver(actuator.id) })));
  const a = acts.run('a', 40, 'manual');
  failOff = true;
  assert.equal(await a.done, false, 'settles instead of hanging');
  assert.equal(pins.get('a'), true, 'the relay is stuck on');
  assert.throws(() => acts.run('b', 40, 'manual'), /failed to switch off/);
  failOff = false;
  await acts.watchdog();
  assert.equal(pins.get('a'), false);
  assert.equal(await acts.run('b', 40, 'manual').done, true, 'pumps run again once it is off');
});
