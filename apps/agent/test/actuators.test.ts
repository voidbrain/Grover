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

test('stop releases the queue so later runs still happen', async () => {
  const { acts, pins, load } = rig();
  await load([pump('a', 10_000), pump('b', 30)]);
  const a = acts.run('a', 10_000, 'manual');
  const b = acts.run('b', 30, 'manual');
  await new Promise((r) => setTimeout(r, 10));
  await acts.allOff('manual');
  await a.done;
  await b.done;
  assert.equal(pins.get('a'), false);
  assert.equal(pins.get('b'), false);
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
