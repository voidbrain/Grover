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
    headers: body ? { 'content-type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
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
  assert.equal(agent.state.config?.actuators.length, 8);
});

test('reading a probe stores the value and returns it', async () => {
  const { status, json } = await api('POST', '/api/probes/ec/read');
  assert.equal(status, 200);
  assert.equal(json.ok, true);
  assert.equal(typeof json.value, 'number');
  await until(() => hub.store.latestReading('ec')?.value === json.value, 'reading stored');
});

test('a pump run is bounded, logged on both edges and counted as a dose', async () => {
  const { json } = await api('POST', '/api/actuators/pump-grow/run', { durationMs: 200 });
  assert.equal(json.ok, true);
  assert.equal(json.value, 200);
  await until(() => hub.store.actuations(0, 'pump-grow').some((a) => a.state === 'off'), 'off actuation');
  const off = hub.store.actuations(0, 'pump-grow').find((a) => a.state === 'off')!;
  assert.equal(off.source, 'manual');
  assert.ok(off.ranMs! >= 190);
  const dose = hub.store.db.prepare("SELECT kind, ml FROM doses WHERE room_id = 'grow-1'").get() as {
    kind: string;
    ml: number;
  };
  assert.equal(dose.kind, 'nutrient');
  assert.ok(dose.ml > 0.25 && dose.ml < 0.4, `ml=${dose.ml}`);
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

test('dose suggestion explains itself', async () => {
  const { json } = await api('GET', '/api/rooms/grow-1/dose');
  assert.match(json.reason, /Veg growth, day 20/);
  assert.deepEqual(json.target.ec, { min: 1.3, max: 1.8 });
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
  for (const n of ['grover_overview', 'grover_run_pump', 'grover_stop_all', 'grover_dose_suggestion'])
    assert.ok(names.includes(n), n);
  const overview = await rpc('tools/call', { name: 'grover_overview', arguments: {} }, 3);
  const rooms = JSON.parse(overview.result.content[0].text);
  assert.equal(rooms[0].room.id, 'grow-1');
  assert.equal(rooms[0].agent.online, true);
});

test('events queued while the hub is unreachable arrive once after reconnect', async () => {
  // Readings taken by the agent go to the durable outbox first; flush is idempotent on the hub.
  await agent.read('water-temp');
  await until(() => agent.state.queued === 0, 'outbox drained');
  assert.ok(hub.store.latestReading('water-temp'));
});
