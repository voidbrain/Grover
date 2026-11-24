import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { mkdtempSync } from 'node:fs';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import mqtt from 'mqtt';
import { MIGRATIONS, openDb } from '../src/db.ts';
import { Store } from '../src/store.ts';
import { loadConfig } from '../src/config.ts';
import { startHub, type RunningHub } from '../src/hub.ts';
import { seedDemo } from '../src/seed.ts';

let hub: RunningHub;
let base: string;

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

test("deleting a pot deletes its probes, pumps and their schedules (they must not become the tent's)", async () => {
  assert.equal((await api('DELETE', '/api/pots/pot-2')).status, 204);
  const ids = [...hub.store.listProbes(), ...hub.store.listActuators()].map((x) => x.id);
  for (const gone of ['pot-2-level', 'pot-2-transfer', 'pot-2-loop']) assert.ok(!ids.includes(gone), gone);
  assert.ok(!hub.store.listSchedules().some((s) => s.id === 'pot-2-loop-on' || s.id === 'read-pot-2-level'));
});

test('requests from other sites or other host names are refused', async () => {
  const raw = (headers: Record<string, string>, method = 'POST', path = '/api/rooms/grow-1/stop', body = '{}') =>
    new Promise<number>((resolve, reject) => {
      const req = request(
        {
          host: '127.0.0.1',
          port: hub.httpPort,
          path,
          method,
          headers: { 'content-type': 'application/json', ...headers },
        },
        (res) => {
          res.resume();
          resolve(res.statusCode ?? 0);
        },
      );
      req.on('error', reject);
      req.end(method === 'GET' ? undefined : body);
    });
  assert.equal(await raw({ host: 'evil.example' }, 'GET', '/api/snapshot'), 403, 'DNS rebinding: unknown Host');
  assert.equal(await raw({ origin: 'https://evil.example' }), 403, 'cross-site Origin');
  assert.equal(await raw({ 'content-type': 'text/plain' }), 415, 'a plain form post');
  const same = await raw({ host: `localhost:${hub.httpPort}`, origin: `http://localhost:${hub.httpPort}` });
  assert.ok(![403, 415].includes(same), `same origin gets past the guard (then refused for its own reason): ${same}`);
});

test('migration 2 leaves auto-feed off, whatever auto-dose was', () => {
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE schema_version (version INTEGER NOT NULL); INSERT INTO schema_version VALUES (1);');
  db.exec(MIGRATIONS[0]!);
  db.prepare("INSERT INTO rooms (id, name, mode, auto_dose) VALUES ('r', 'R', 'normal', 1)").run();
  db.close();
  const path = join(mkdtempSync(join(tmpdir(), 'grover-mig-')), 'hub.sqlite');
  const old = new DatabaseSync(path);
  old.exec('CREATE TABLE schema_version (version INTEGER NOT NULL); INSERT INTO schema_version VALUES (1);');
  old.exec(MIGRATIONS[0]!);
  old.prepare("INSERT INTO rooms (id, name, mode, auto_dose) VALUES ('r', 'R', 'normal', 1)").run();
  old.close();
  const upgraded = new Store(openDb(path));
  assert.equal(upgraded.getRoom('r').autoFeed, false);
  upgraded.db.close();
});
