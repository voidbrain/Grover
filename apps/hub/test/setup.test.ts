import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import mqtt from 'mqtt';
import { loadConfig } from '../src/config.ts';
import { startHub, type RunningHub } from '../src/hub.ts';
import { seedDemo } from '../src/seed.ts';

let hub: RunningHub;
let base: string;

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
    loadConfig({ dbPath: ':memory:', httpPort: 0, mqttPort: 0, clientDir: '/nonexistent', timezone: 'UTC' }),
  );
  seedDemo(hub.store, 'pi-1');
  base = `http://127.0.0.1:${hub.httpPort}`;
});

after(() => hub.close());

test('deleting a probe or actuator removes the schedules that target it', async () => {
  assert.ok(hub.store.listSchedules().some((s) => s.id === 'read-ph'));
  assert.equal((await api('DELETE', '/api/probes/ph')).status, 204);
  assert.ok(!hub.store.listSchedules().some((s) => s.id === 'read-ph'));
  assert.equal((await api('DELETE', '/api/actuators/light')).status, 204);
  assert.ok(!hub.store.listSchedules().some((s) => s.id === 'light-veg'));
  assert.ok(
    hub.store.listSchedules().some((s) => s.id === 'fan-day'),
    'other schedules stay',
  );
});

test('a calendar used by a room cannot be deleted', async () => {
  const res = await api('DELETE', '/api/calendars/default');
  assert.equal(res.status, 409);
  assert.match(res.json.error, /in use/);
});

test('an agent runs one room at most', async () => {
  const res = await api('PUT', '/api/rooms/grow-2', {
    name: 'Second room',
    agentId: 'pi-1',
    mode: 'normal',
    autoFeed: false,
    calendarId: null,
    calendarStart: null,
  });
  assert.equal(res.status, 409);
  assert.match(res.json.error, /another room/);
});

test('invalid bodies come back as 400 with the schema issues', async () => {
  const res = await api('PUT', '/api/pots/pot-9', { roomId: 'grow-1', name: '' });
  assert.equal(res.status, 400);
  assert.equal(res.json.issues[0].path[0], 'name');
});

test('rotating a token drops the connected agent; deleting the agent detaches its room', async () => {
  const token = (await api('POST', '/api/agents/pi-1/token')).json.token as string;
  const client = await mqtt.connectAsync(`mqtt://127.0.0.1:${hub.mqttPort}`, {
    clientId: 'pi-1',
    username: 'pi-1',
    password: token,
    reconnectPeriod: 0,
  });
  const closed = new Promise<void>((r) => client.once('close', () => r()));
  const rotated = await api('POST', '/api/agents/pi-1/token');
  assert.notEqual(rotated.json.token, token);
  await closed;

  assert.equal((await api('DELETE', '/api/agents/pi-1')).status, 204);
  assert.equal(hub.store.getRoom('grow-1').agentId, null);
  assert.equal(hub.store.checkAgentToken('pi-1', rotated.json.token), false);
  assert.equal((await api('DELETE', '/api/agents/pi-1')).status, 404);
});
