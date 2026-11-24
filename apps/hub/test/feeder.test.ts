import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { AgentView, CommandAck } from '@grover/contracts';
import { CommandTimeout } from '../src/agents.ts';
import { Alerts } from '../src/alerts.ts';
import { openDb } from '../src/db.ts';
import { Bus } from '../src/events.ts';
import { Feeder } from '../src/feeder.ts';
import { seedDemo } from '../src/seed.ts';
import { Store } from '../src/store.ts';

/** A Feeder with a fake agent link: `answer` decides how the agent responds to the feed command. */
function rig(answer: () => Promise<CommandAck>) {
  const store = new Store(openDb(':memory:'));
  seedDemo(store, 'pi-1');
  for (const p of ['pot-1-level', 'pot-1-ec', 'pot-1-ph', 'pot-2-level', 'ec', 'ph'])
    store.addReading({ probeId: p, value: p.includes('level') ? 20 : p.includes('ec') ? 1.0 : 6.2, at: Date.now() });
  const bus = new Bus();
  const alerts = new Alerts(store, bus);
  const sent: string[] = [];
  const agents = {
    isOnline: () => true,
    command: async (_agent: string, body: { kind: string }) => {
      sent.push(body.kind);
      return answer();
    },
  };
  const feeder = new Feeder(store, bus, agents as never, alerts, { mixMs: 600_000, freshMs: 3_600_000 });
  const agentEvent = (online: boolean, feed: string | null, queued = 0, at = Date.now() + 1) =>
    bus.emit({
      type: 'agent',
      agent: {
        agentId: 'pi-1',
        roomId: 'grow-1',
        online,
        lastSeen: Date.now(),
        configCurrent: true,
        status: {
          state: online ? 'online' : 'offline',
          protocol: 2,
          version: 't',
          configHash: null,
          mode: 'normal',
          active: [],
          feed,
          queued,
          at,
        },
      } as AgentView,
    });
  return { store, feeder, sent, agentEvent, bus };
}

const ok = (): Promise<CommandAck> => Promise.resolve({ id: 'x', ok: true, error: null, value: null, at: Date.now() });

test('two feeds requested together: the second is refused, the first stays reserved', async () => {
  const slowOk = () =>
    new Promise<CommandAck>((r) =>
      setTimeout(() => r({ id: 'x', ok: true, error: null, value: null, at: Date.now() }), 30),
    );
  const { feeder, sent } = rig(slowOk);
  const [a, b] = await Promise.all([feeder.feed('pot-1', 'manual'), feeder.feed('pot-2', 'auto')]);
  assert.notEqual(a.state, 'refused', a.message);
  assert.equal(b.state, 'refused');
  assert.match(b.message, /another feed/);
  assert.deepEqual(
    sent.filter((k) => k === 'feed'),
    ['feed'],
    'only one feed command was sent',
  );
  const c = await feeder.feed('pot-2', 'manual');
  assert.match(c.message, /another feed/, 'still reserved by the first');
});

test('the agent dropping off keeps the feed open; its status after reconnecting decides', async () => {
  const { feeder, store, agentEvent } = rig(ok);
  const a = await feeder.feed('pot-1', 'manual');
  agentEvent(false, null);
  assert.equal(
    store.getFeed(a.feedId)!.state,
    'planned',
    'a short network drop does not end a feed the agent may still run',
  );
  agentEvent(true, a.feedId);
  assert.equal(store.getFeed(a.feedId)!.state, 'planned', 'still running it');
  agentEvent(true, null, 3);
  assert.equal(store.getFeed(a.feedId)!.state, 'planned', 'events still queued: they may hold its "done"');
  agentEvent(true, null, 0, Date.now() - 60_000);
  assert.equal(store.getFeed(a.feedId)!.state, 'planned', 'a status from before the agent answered says nothing');
  agentEvent(true, null, 0);
  assert.equal(store.getFeed(a.feedId)!.state, 'aborted');
  const b = await feeder.feed('pot-2', 'manual');
  assert.notEqual(b.state, 'refused', b.message);
});

test('a planning error does not leave the tent blocked', async () => {
  const { feeder, store } = rig(ok);
  const original = store.getPot.bind(store);
  let calls = 0;
  store.getPot = (id: string) => {
    if (++calls === 2) throw new Error('pot vanished');
    return original(id);
  };
  await assert.rejects(feeder.feed('pot-1', 'manual'), /vanished/);
  const b = await feeder.feed('pot-2', 'manual');
  assert.notEqual(b.state, 'refused', b.message);
});

test('no answer to the feed command: the feed is not final until the agent says what it runs', async () => {
  const { feeder, store, agentEvent } = rig(() => Promise.reject(new CommandTimeout('no answer')));
  const a = await feeder.feed('pot-1', 'manual');
  assert.equal(store.getFeed(a.feedId)!.state, 'planned', 'it may have started: do not close it');
  assert.match((await feeder.feed('pot-2', 'manual')).message, /another feed/);
  // The agent reports it is running nothing: the hub closes the feed and frees the tent.
  agentEvent(true, null);
  assert.equal(store.getFeed(a.feedId)!.state, 'aborted');
  // Had it reported this feed, it would have stayed open.
  const { feeder: f2, store: s2, agentEvent: ev2 } = rig(() => Promise.reject(new CommandTimeout('no answer')));
  const b = await f2.feed('pot-1', 'manual');
  ev2(true, b.feedId);
  assert.equal(s2.getFeed(b.feedId)!.state, 'planned');
});

test('after a hub restart an open feed stays open until the agent says what it runs', () => {
  const store = new Store(openDb(':memory:'));
  seedDemo(store, 'pi-1');
  store.addFeed({
    feedId: 'old',
    roomId: 'grow-1',
    potId: 'pot-1',
    source: 'manual',
    state: 'started',
    message: '',
    requestedAt: Date.now() - 60_000,
    finishedAt: null,
    batchLiters: 2,
    ml: null,
    ecBefore: null,
    phBefore: null,
    ecAfter: null,
    phAfter: null,
    potLitersBefore: 10,
    expectedEc: null,
    expectedPh: null,
  });
  const bus = new Bus();
  const feeder = new Feeder(store, bus, { isOnline: () => true } as never, new Alerts(store, bus), {
    mixMs: 1,
    freshMs: 1,
  });
  assert.equal(store.getFeed('old')!.state, 'started', 'the agent may still be running it');
  void feeder;
  const view = (feed: string | null) =>
    bus.emit({
      type: 'agent',
      agent: {
        agentId: 'pi-1',
        roomId: 'grow-1',
        online: true,
        lastSeen: Date.now(),
        configCurrent: true,
        status: {
          state: 'online',
          protocol: 2,
          version: 't',
          configHash: null,
          mode: 'normal',
          active: [],
          feed,
          queued: 0,
          at: Date.now(),
        },
      } as AgentView,
    });
  view('old');
  assert.equal(store.getFeed('old')!.state, 'started');
  view(null);
  assert.equal(store.getFeed('old')!.state, 'aborted');
  assert.match(store.getFeed('old')!.message, /not running/);
});
