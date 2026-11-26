import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { AgentView, CommandAck } from '@grover/contracts';
import { Alerts } from '../src/alerts.ts';
import { openDb } from '../src/db.ts';
import { Bus } from '../src/events.ts';
import { Feeder } from '../src/feeder.ts';
import { seedDemo } from '../src/seed.ts';
import { Store } from '../src/store.ts';

/**
 * Pins the alert contract NERV reads (docs/DESIGN.md, "Alert contract"): the shape, the key grammar per condition
 * and the meaning of `warn` and `bad`. A change here changes what NERV classifies and delivers: the PR names
 * nerv:F-122 (and coordinator:F-018, the `alerts/1` mapping).
 */

const FIELDS = ['key', 'level', 'message', 'potId', 'roomId', 'since'];
const KEY = /^(probe:[a-z0-9][a-z0-9_-]*:(below|above)|feed:[a-z0-9][a-z0-9_-]*|agent:[a-z0-9][a-z0-9_-]*)$/;

const ok = (): Promise<CommandAck> =>
  Promise.resolve({ id: 'x', ok: true, error: null, value: null, at: Date.now(), calibratedAt: null });

function rig(online = true) {
  const store = new Store(openDb(':memory:'));
  seedDemo(store, 'pi-1');
  for (const p of ['pot-1-level', 'pot-1-ec', 'pot-1-ph', 'pot-2-level', 'ec', 'ph'])
    store.addReading({ probeId: p, value: p.includes('level') ? 20 : p.includes('ec') ? 1.0 : 6.2, at: Date.now() });
  const bus = new Bus();
  const alerts = new Alerts(store, bus);
  const agents = { isOnline: () => online, command: ok };
  const feeder = new Feeder(store, bus, agents as never, alerts, { mixMs: 600_000, freshMs: 3_600_000 });
  const agentEvent = (isOnline: boolean, feed: string | null = null, seen = Date.now() + 1) =>
    bus.emit({
      type: 'agent',
      agent: {
        agentId: 'pi-1',
        roomId: 'grow-1',
        online: isOnline,
        lastSeen: seen,
        configCurrent: true,
        status: {
          state: isOnline ? 'online' : 'offline',
          protocol: 2,
          version: 't',
          configHash: null,
          mode: 'normal',
          active: [],
          feed,
          queued: 0,
          at: seen,
        },
      } as AgentView,
    });
  const reading = (probeId: string, value: number) => {
    const r = { probeId, value, at: Date.now() + 5 };
    store.addReading(r);
    bus.emit({ type: 'reading', reading: r });
  };
  return { store, alerts, feeder, agentEvent, reading, bus };
}

function assertShape(a: object): void {
  assert.deepEqual(Object.keys(a).sort(), FIELDS, 'an alert has exactly these fields');
}

test('a probe out of range: key probe:<id>:below|above, level warn, room and pot of the probe, since in ms', () => {
  const { store, alerts, reading } = rig();
  reading('tank-grow', 2.9);
  reading('air-temp', 40);
  const list = alerts.list();
  assert.deepEqual(list.map((a) => a.key).sort(), ['probe:air-temp:above', 'probe:tank-grow:below']);
  for (const a of list) {
    assertShape(a);
    assert.match(a.key, KEY);
    assert.equal(a.level, 'warn');
    assert.ok(Number.isInteger(a.since) && a.since > 0);
    assert.ok(a.message.length > 0);
    const probe = store.getProbe(a.key.split(':')[1]!);
    assert.equal(a.roomId, probe.roomId);
    assert.equal(a.potId, probe.potId);
  }
});

test('an agent offline: key agent:<id>, level bad, no pot; back online clears it', () => {
  const { alerts, agentEvent } = rig();
  agentEvent(false);
  const [a, ...rest] = alerts.list();
  assert.equal(rest.length, 0);
  assertShape(a!);
  assert.equal(a!.key, 'agent:pi-1');
  assert.equal(a!.level, 'bad');
  assert.equal(a!.potId, null);
  assert.equal(a!.roomId, 'grow-1');
  agentEvent(true);
  assert.deepEqual(alerts.list(), []);
});

test('an automatic feed refused: key feed:<pot>, level warn; a manual refusal raises nothing', async () => {
  const { alerts, feeder } = rig(false);
  await feeder.feed('pot-1', 'manual');
  assert.deepEqual(alerts.list(), []);
  await feeder.feed('pot-1', 'auto');
  const [a, ...rest] = alerts.list();
  assert.equal(rest.length, 0);
  assertShape(a!);
  assert.equal(a!.key, 'feed:pot-1');
  assert.equal(a!.level, 'warn');
  assert.equal(a!.potId, 'pot-1');
  assert.equal(a!.roomId, 'grow-1');
});

test('a feed stopped partway: feed:<pot> is bad, rising from warn keeps the episode (same since); a finished feed clears it', async () => {
  const { alerts, feeder, bus } = rig(false);
  await feeder.feed('pot-1', 'auto');
  const warned = alerts.list()[0]!;
  assert.equal(warned.level, 'warn');
  // The feed stops partway: the same key rises to bad.
  const stopped = {
    feedId: 'f-1',
    roomId: 'grow-1',
    potId: 'pot-1',
    source: 'auto' as const,
    state: 'aborted' as const,
    message: 'pump stalled',
    requestedAt: 1,
    finishedAt: 2,
    batchLiters: 2,
    ml: null,
    ecBefore: null,
    phBefore: null,
    ecAfter: null,
    phAfter: null,
    potLitersBefore: null,
    expectedEc: null,
    expectedPh: null,
  };
  bus.emit({ type: 'feed', feed: stopped });
  const [a, ...rest] = alerts.list();
  assert.equal(rest.length, 0, 'one alert per key');
  assert.equal(a!.key, 'feed:pot-1');
  assert.equal(a!.level, 'bad');
  assert.equal(a!.since, warned.since, 'the episode (key, since) is the same');
  bus.emit({ type: 'feed', feed: { ...stopped, state: 'done' } });
  assert.deepEqual(alerts.list(), []);
});

test('a raised key is stable and an episode is (key, since): re-raising keeps since, a clear then raise starts a new one', () => {
  const { alerts, reading } = rig();
  reading('tank-grow', 2.9);
  const first = alerts.list()[0]!;
  reading('tank-grow', 2.8);
  assert.equal(alerts.list()[0]!.since, first.since);
  reading('tank-grow', 9);
  assert.deepEqual(alerts.list(), []);
  reading('tank-grow', 2.9);
  assert.equal(alerts.list()[0]!.key, first.key);
  assert.ok(alerts.list()[0]!.since >= first.since);
});
