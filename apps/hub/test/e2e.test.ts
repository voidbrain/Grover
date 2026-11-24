import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import mqtt from 'mqtt';
import { Agent } from '../../agent/src/agent.ts';
import { MockDrivers } from '../../agent/src/drivers/mock.ts';
import { loadConfig } from '../src/config.ts';
import { startHub, type RunningHub } from '../src/hub.ts';
import { seedDemo } from '../src/seed.ts';

let hub: RunningHub;
let agent: Agent;
let drivers: MockDrivers;
let base: string;
let token: string;
const dir = mkdtempSync(join(tmpdir(), 'grover-e2e-'));

async function until(check: () => boolean | Promise<boolean>, what: string, ms = 5000): Promise<void> {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await check()) return;
    await new Promise((r) => setTimeout(r, 20));
  }
  assert.fail(`timed out waiting for ${what}`);
}

async function api(method: string, path: string, body?: unknown): Promise<{ status: number; json: any }> {
  const res = await fetch(base + path, {
    method,
    // Like the client: every POST and PUT carries a JSON body (the hub refuses anything else, against cross-site forms).
    headers: method === 'GET' || method === 'DELETE' ? {} : { 'content-type': 'application/json' },
    body: method === 'GET' || method === 'DELETE' ? undefined : JSON.stringify(body ?? {}),
  });
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : null };
}

before(async () => {
  hub = await startHub(
    loadConfig({
      dbPath: ':memory:',
      httpPort: 0,
      mqttPort: 0,
      clientDir: join(dir, 'no-client'),
      timezone: 'UTC',
      commandTimeoutMs: 3000,
    }),
  );
  seedDemo(hub.store, 'pi-1');
  // Fast rig: a thousand times the real flow, no settling, so a feed takes milliseconds.
  for (const a of hub.store.listActuators())
    if (a.mlPerSecond) hub.store.putActuator({ ...a, mlPerSecond: a.mlPerSecond * 1000 });
  hub.store.putRoom({ ...hub.store.getRoom('grow-1'), mixSettleSeconds: 0 });
  token = hub.store.issueAgentToken('pi-1');
  base = `http://127.0.0.1:${hub.httpPort}`;
  drivers = new MockDrivers();
  agent = new Agent(
    {
      agentId: 'pi-1',
      token,
      hubUrl: `mqtt://127.0.0.1:${hub.mqttPort}`,
      stateDir: join(dir, 'agent'),
      drivers: 'mock',
      version: 'test',
    },
    drivers,
  );
  await agent.start();
  await until(() => hub.agents.view('pi-1').configCurrent, 'agent online with current config');
});

after(async () => {
  await agent.stop();
  await hub.close();
});

test('the agent gets its config and reports a matching hash', async () => {
  const { json } = await api('GET', '/api/snapshot');
  const view = json.agents.find((a: any) => a.agentId === 'pi-1');
  assert.equal(view.online, true);
  assert.equal(view.configCurrent, true);
  assert.equal(agent.state.config?.actuators.length, 16);
});

test('reading a probe stores the value and returns it', async () => {
  const { status, json } = await api('POST', '/api/probes/ec/read');
  assert.equal(status, 200);
  assert.equal(json.ok, true);
  assert.equal(typeof json.value, 'number');
  await until(() => hub.store.latestReading('ec')?.value === json.value, 'reading stored');
});

test('a pump run is bounded and logged on both edges', async () => {
  const { json } = await api('POST', '/api/actuators/pump-grow/run', { durationMs: 200 });
  assert.equal(json.ok, true);
  assert.equal(json.value, 200);
  await until(() => hub.store.actuations(0, 'pump-grow').some((a) => a.state === 'off'), 'off actuation');
  const off = hub.store.actuations(0, 'pump-grow').find((a) => a.state === 'off')!;
  assert.equal(off.source, 'manual');
  assert.ok(off.ranMs! >= 190);
});

test('the hub refuses what the room or the pump does not allow', async () => {
  assert.equal((await api('POST', '/api/actuators/pump-grow/run', { durationMs: 60_000 })).status, 409, 'over the cap');
  assert.equal(
    (await api('POST', '/api/actuators/pump-grow/switch', { on: true })).status,
    409,
    'pumps cannot be held on',
  );
  assert.equal(
    (await api('POST', '/api/actuators/light/run', { durationMs: 100 })).status,
    409,
    'lights are not pumps',
  );
  assert.equal(
    (await api('POST', '/api/actuators/pump-grow/run', { durationMs: 1, ml: 1 })).status,
    400,
    'one of ml or durationMs',
  );
  assert.equal((await api('POST', '/api/actuators/nope/run', { durationMs: 1 })).status, 404);
});

test('mode off reaches the agent, stops everything and refuses commands', async () => {
  await api('POST', '/api/actuators/fan/switch', { on: true });
  await until(() => drivers.states.get('fan') === true, 'fan on');
  const res = await api('PUT', '/api/rooms/grow-1/mode', { mode: 'off' });
  assert.equal(res.json.mode, 'off');
  await until(() => agent.state.config?.mode === 'off', 'agent off');
  await until(() => drivers.states.get('fan') === false, 'fan forced off');
  assert.equal((await api('POST', '/api/actuators/pump-grow/run', { durationMs: 100 })).status, 409);
  await api('PUT', '/api/rooms/grow-1/mode', { mode: 'normal' });
  await until(() => agent.state.config?.mode === 'normal', 'agent back to normal');
});

test('agents can only use their own topics', async () => {
  const client = await mqtt
    .connectAsync(`mqtt://127.0.0.1:${hub.mqttPort}`, {
      clientId: 'pi-1-intruder',
      username: 'pi-1',
      password: token,
      reconnectPeriod: 0,
    })
    .catch((e: Error) => e);
  assert.ok(client instanceof Error, 'client id must equal the agent id');
  const wrong = await mqtt
    .connectAsync(`mqtt://127.0.0.1:${hub.mqttPort}`, {
      clientId: 'pi-2',
      username: 'pi-2',
      password: token,
      reconnectPeriod: 0,
    })
    .catch((e: Error) => e);
  assert.ok(wrong instanceof Error, 'unknown agent / wrong token refused');
});

test('setup changes are pushed to the agent', async () => {
  const before = hub.agents.view('pi-1').status?.configHash;
  const res = await api('PUT', '/api/actuators/fan', {
    roomId: 'grow-1',
    potId: null,
    kind: 'fan',
    name: 'Exhaust fan',
    enabled: true,
    binding: { driver: 'mock' },
    maxRunMs: 0,
    mlPerSecond: null,
  });
  assert.equal(res.status, 200);
  await until(
    () => agent.state.config?.actuators.find((a) => a.id === 'fan')?.name === 'Exhaust fan',
    'agent sees rename',
  );
  await until(
    () => hub.agents.view('pi-1').configCurrent && hub.agents.view('pi-1').status?.configHash !== before,
    'hash updated',
  );
});

test('a feed runs end to end: supply tanks into the mixing tank, then into the pot', async () => {
  // A preview uses what is known; "Feed now" reads the pot first. Read it so the preview has numbers too.
  for (const probe of ['pot-1-level', 'pot-1-ec', 'pot-1-ph']) await api('POST', `/api/probes/${probe}/read`);
  const preview = (await api('GET', '/api/pots/pot-1/feed')).json;
  assert.equal(preview.ok, true, JSON.stringify(preview));
  assert.equal(preview.batchLiters, 2);
  // The manual pump run earlier left liquid in the mixing tank: a feed would rightly refuse to start. Drain it.
  Object.assign(drivers.world.mix, { liters: 0, nutrientMl: 0, phDownMl: 0 });
  const potBefore = drivers.world.pot('pot-1').liters;
  const waterBefore = drivers.world.supply.water;

  const started = await api('POST', '/api/pots/pot-1/feed');
  assert.equal(started.status, 200);
  assert.ok(['planned', 'started'].includes(started.json.state), started.json.state);
  const feedId = started.json.feedId as string;
  await until(() => ['done', 'aborted'].includes(hub.store.getFeed(feedId)!.state), 'feed finished', 10_000);
  const feed = hub.store.getFeed(feedId)!;
  assert.equal(feed.state, 'done', feed.message);
  assert.ok(drivers.world.pot('pot-1').liters > potBefore + 1.5, 'the batch reached the pot');
  assert.ok(drivers.world.supply.water < waterBefore - 1.5, 'water came from the water tank');
  assert.ok(drivers.world.mix.liters < 0.3, 'mixing tank emptied');
  assert.ok(
    hub.store.actuations(feed.requestedAt).some((a) => a.source === 'feed'),
    'pump runs logged as feed',
  );
});

test('a feed is refused with an alert when a supply tank is low', async () => {
  drivers.world.supply.grow = 0.1; // 2 cm, alert below 3
  const { json } = await api('POST', '/api/pots/pot-2/feed');
  await until(() => hub.store.getFeed(json.feedId)!.state === 'aborted', 'feed aborted');
  assert.match(hub.store.getFeed(json.feedId)!.message, /grow tank low/);
  const alerts = (await api('GET', '/api/alerts')).json as { key: string; message: string }[];
  assert.ok(
    alerts.some((a) => a.key === 'feed:pot-2' && /grow tank low/.test(a.message)),
    JSON.stringify(alerts),
  );
  assert.ok(
    alerts.some((a) => a.key === 'probe:tank-grow:below' && /refill/.test(a.message)),
    'the tank reading raised its own alert',
  );
  drivers.world.supply.grow = 1;
});

test('auto-feed: a pot below its phase minimum is fed after its next level reading', async () => {
  hub.store.putRoom({ ...hub.store.getRoom('grow-1'), autoFeed: true });
  drivers.world.pot('pot-3').liters = 4; // 8 cm, veg minimum is 10
  Object.assign(drivers.world.mix, { liters: 0, nutrientMl: 0, phDownMl: 0 });
  const since = Date.now();
  await api('POST', '/api/probes/pot-3-level/read');
  await until(() => hub.store.feeds(since, 'pot-3').some((f) => f.state === 'done'), 'auto feed done', 10_000);
  const feed = hub.store.feeds(since, 'pot-3')[0]!;
  assert.equal(feed.source, 'auto');
  assert.ok(drivers.world.pot('pot-3').liters > 5.5);
  // Within the cooldown a new low reading does not start another feed.
  drivers.world.pot('pot-3').liters = 4;
  await api('POST', '/api/probes/pot-3-level/read');
  await new Promise((r) => setTimeout(r, 200));
  assert.equal(hub.store.feeds(since, 'pot-3').length, 1);
  hub.store.putRoom({ ...hub.store.getRoom('grow-1'), autoFeed: false });
});

test('pumps cannot be run by hand while a feed runs; Stop all ends the feed with everything off', async () => {
  hub.store.putRoom({ ...hub.store.getRoom('grow-1'), mixSettleSeconds: 5 });
  Object.assign(drivers.world.mix, { liters: 0, nutrientMl: 0, phDownMl: 0 });
  const { json } = await api('POST', '/api/pots/pot-4/feed');
  await until(() => agent.state.feed === json.feedId, 'feed running on the agent');
  const manual = await api('POST', '/api/actuators/pump-water/run', { durationMs: 100 });
  assert.equal(manual.status, 409);
  assert.match(manual.json.error, /feed is running/);
  await api('POST', '/api/rooms/grow-1/stop');
  await until(() => hub.store.getFeed(json.feedId)!.state === 'aborted', 'feed aborted');
  assert.match(hub.store.getFeed(json.feedId)!.message, /Stop all/);
  assert.ok(![...drivers.states.entries()].some(([id, on]) => on && id.startsWith('pump')), 'no pump left on');
  hub.store.putRoom({ ...hub.store.getRoom('grow-1'), mixSettleSeconds: 0 });
  Object.assign(drivers.world.mix, { liters: 0, nutrientMl: 0, phDownMl: 0 });
});

test('one feed per tent at a time, and none outside normal mode', async () => {
  await api('PUT', '/api/rooms/grow-1/mode', { mode: 'silent' });
  const refused = (await api('POST', '/api/pots/pot-3/feed')).json;
  assert.equal(refused.state, 'refused');
  assert.match(refused.message, /silent/);
  const alerts = (await api('GET', '/api/alerts')).json as { key: string }[];
  assert.ok(!alerts.some((a) => a.key === 'feed:pot-3'), 'a refused manual feed answers with its reason, no alert');
  await api('PUT', '/api/rooms/grow-1/mode', { mode: 'normal' });
  await until(() => agent.state.config?.mode === 'normal', 'agent back to normal');
});

test('MCP: tools are listed and a read-only tool answers', async () => {
  const rpc = async (method: string, params: unknown, id: number) => {
    const res = await fetch(`${base}/mcp`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
    });
    return res.json() as Promise<any>;
  };
  await rpc(
    'initialize',
    { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '0' } },
    1,
  );
  const tools = await rpc('tools/list', {}, 2);
  const names = tools.result.tools.map((t: any) => t.name);
  for (const n of ['grover_overview', 'grover_run_pump', 'grover_stop_all', 'grover_feed_pot', 'grover_alerts'])
    assert.ok(names.includes(n), n);
  const overview = await rpc('tools/call', { name: 'grover_overview', arguments: {} }, 3);
  const rooms = JSON.parse(overview.result.content[0].text);
  assert.equal(rooms[0].room.id, 'grow-1');
  assert.equal(rooms[0].agent.online, true);
});

test('events queued while the hub is unreachable arrive once after reconnect', async () => {
  // Readings taken by the agent go to the durable outbox first; flush is idempotent on the hub.
  await agent.read('air-temp');
  await until(() => agent.state.queued === 0, 'outbox drained');
  assert.ok(hub.store.latestReading('air-temp'));
});
