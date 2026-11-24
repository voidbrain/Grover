import { DEFAULT_TANK_COLOURS } from '@grover/contracts';
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

test('pumps saved without a run cap get one on upgrade, so the hub can still read them', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'grover-mig3-')), 'hub.sqlite');
  const db = new DatabaseSync(path);
  db.exec('CREATE TABLE schema_version (version INTEGER NOT NULL); INSERT INTO schema_version VALUES (2);');
  db.exec(MIGRATIONS[0]!);
  db.exec(MIGRATIONS[1]!);
  db.prepare("INSERT INTO rooms (id, name, mode) VALUES ('r', 'R', 'normal')").run();
  db.prepare(
    "INSERT INTO actuators (id, room_id, kind, name, binding, max_run_ms, ml_per_second) VALUES ('p', 'r', 'pump_grow', 'P', '{\"driver\":\"mock\"}', 0, 1)",
  ).run();
  db.prepare(
    "INSERT INTO actuators (id, room_id, kind, name, binding, max_run_ms) VALUES ('l', 'r', 'light', 'L', '{\"driver\":\"mock\"}', 0)",
  ).run();
  db.close();
  const store = new Store(openDb(path));
  assert.equal(store.getActuator('p').maxRunMs, 30_000);
  assert.equal(store.getActuator('l').maxRunMs, 0, 'switches keep no cap');
  store.db.close();
});

test('breeders, strains and plants: saved, read back, and not deleted while in use', async () => {
  assert.equal((await api('PUT', '/api/breeders/acme', { name: 'Acme Seeds' })).status, 200);
  assert.equal((await api('PUT', '/api/strains/parent-a', { name: 'Parent A' })).status, 200);
  const strain = await api('PUT', '/api/strains/cross', {
    name: 'Cross',
    breederId: 'acme',
    parentIds: ['parent-a'],
    sativaPercent: 70,
    thcPercent: 20,
    floweringDays: 70,
  });
  assert.equal(strain.status, 200);
  const mother = await api('PUT', '/api/plants/mother', {
    name: 'Mother',
    strainId: 'cross',
    breederId: 'acme',
    generation: 1,
  });
  assert.equal(mother.status, 200);
  const plant = await api('PUT', '/api/plants/cutting', {
    name: 'Cutting',
    strainId: 'cross',
    breederId: 'acme',
    generation: 2,
    motherId: 'mother',
    potId: 'pot-4', // pot 3 holds the demo plant: one growing plant per pot (F-013)
    startedOn: '2026-11-01',
  });
  assert.equal(plant.status, 200, JSON.stringify(plant.json));
  const snap = (await api('GET', '/api/snapshot')).json;
  assert.equal(snap.plants.find((p: any) => p.id === 'cutting').potId, 'pot-4');
  assert.deepEqual(snap.strains.find((s: any) => s.id === 'cross').parentIds, ['parent-a']);

  assert.equal((await api('DELETE', '/api/strains/parent-a')).status, 409, 'a parent of another strain');
  assert.equal((await api('DELETE', '/api/strains/cross')).status, 409, 'plants of this strain');
  assert.equal((await api('DELETE', '/api/breeders/acme')).status, 409, 'strains and plants from this breeder');
  // Changed on purpose (review of #18, finding 5): a strain naming itself as parent is bad input (400), not "in use".
  assert.equal((await api('PUT', '/api/strains/self', { name: 'Self', parentIds: ['self'] })).status, 400);
  assert.equal((await api('PUT', '/api/plants/bad', { name: 'Bad', generation: 0, motherId: 'mother' })).status, 400);

  // A deleted mother leaves the cutting without one; a deleted pot leaves its plant without a pot.
  assert.equal((await api('DELETE', '/api/plants/mother')).status, 204);
  assert.equal(hub.store.listPlants().find((p) => p.id === 'cutting')!.motherId, null);
  assert.equal((await api('DELETE', '/api/pots/pot-4')).status, 204);
  assert.equal(
    hub.store.listPlants().find((p) => p.id === 'cutting')!.potId,
    null,
    'the plant is kept, out of the pot',
  );
});

test('references to unknown records are refused as such (400), and a strain cannot descend from itself', async () => {
  const bad = await api('PUT', '/api/plants/ghost', { name: 'Ghost', strainId: 'no-such-strain' });
  assert.equal(bad.status, 400);
  assert.match(bad.json.error, /unknown strain no-such-strain/);
  assert.equal((await api('PUT', '/api/strains/orphan', { name: 'Orphan', parentIds: ['nope'] })).status, 400);
  await api('PUT', '/api/strains/aa', { name: 'AA' });
  await api('PUT', '/api/strains/bb', { name: 'BB', parentIds: ['aa'] });
  const cycle = await api('PUT', '/api/strains/aa', { name: 'AA', parentIds: ['bb'] });
  assert.equal(cycle.status, 400);
  assert.match(cycle.json.error, /own ancestor/);
});

test('migration 5 clears calendar start dates it cannot read', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'grover-mig5-')), 'hub.sqlite');
  const db = new DatabaseSync(path);
  db.exec('CREATE TABLE schema_version (version INTEGER NOT NULL); INSERT INTO schema_version VALUES (4);');
  for (const m of MIGRATIONS.slice(0, 4)) db.exec(m);
  db.prepare(
    "INSERT INTO rooms (id, name, mode, calendar_start) VALUES ('a', 'A', 'normal', '2026-11-01T10:00:00Z')",
  ).run();
  db.prepare("INSERT INTO rooms (id, name, mode, calendar_start) VALUES ('b', 'B', 'normal', 'soon')").run();
  db.close();
  const store = new Store(openDb(path));
  assert.equal(store.getRoom('a').calendarStart, '2026-11-01');
  assert.equal(store.getRoom('b').calendarStart, null);
  store.db.close();
});

test('nutrient colours are kept with the tent (F-017)', async () => {
  const room = (await api('GET', '/api/snapshot')).json.rooms.find((r: { id: string }) => r.id === 'grow-1');
  const { phase: _phase, ...stored } = room;
  const res = await api('PUT', '/api/rooms/grow-1', { ...stored, tankColours: { grow: '#1a7f37', bloom: '#7b3fa0' } });
  assert.equal(res.status, 200, JSON.stringify(res.json));
  assert.deepEqual(hub.store.getRoom('grow-1').tankColours, { grow: '#1a7f37', bloom: '#7b3fa0' });
  assert.equal((await api('PUT', '/api/rooms/grow-1', { ...stored, tankColours: { grow: 'red' } })).status, 400);
});

test('nutrient colours: a damaged stored value keeps the good keys; defaults and case are normalised (review of #28)', () => {
  const store = new Store(openDb(':memory:'));
  seedDemo(store, 'pi-1');
  store.db.prepare('UPDATE rooms SET tank_colours = ? WHERE id = ?').run('not json', 'grow-1');
  assert.deepEqual(store.getRoom('grow-1').tankColours, {}, 'unreadable: the defaults');
  store.db
    .prepare('UPDATE rooms SET tank_colours = ? WHERE id = ?')
    .run(JSON.stringify({ grow: '#1a7f37', mix: '#000000', bloom: 'red' }), 'grow-1');
  assert.deepEqual(store.getRoom('grow-1').tankColours, { grow: '#1a7f37' }, 'only the bad keys are dropped');
  const saved = store.putRoom({
    ...store.getRoom('grow-1'),
    tankColours: { grow: '#1A7F37', water: DEFAULT_TANK_COLOURS.water },
  });
  assert.deepEqual(saved.tankColours, { grow: '#1a7f37' }, 'lower case; a default is not stored');
  assert.deepEqual(store.getRoom('grow-1').tankColours, { grow: '#1a7f37' });
});

test('an actuator on a pin another one already uses is refused (review of #29)', async () => {
  const body = (id: string, binding: object, kind = 'pump_grow') => ({
    roomId: 'grow-1',
    potId: null,
    kind,
    name: id,
    enabled: true,
    binding,
    maxRunMs: kind === 'light' ? 0 : 30_000,
    mlPerSecond: null,
  });
  const bridge = { driver: 'l298n', i2cBus: 1, i2cAddress: 0x22, in1: 4, in2: 5, enable: null };
  assert.equal((await api('PUT', '/api/actuators/bridge-a', body('bridge-a', bridge))).status, 200);
  const clash = await api(
    'PUT',
    '/api/actuators/relay-x',
    body('relay-x', { driver: 'mcp23017', i2cBus: 1, i2cAddress: 0x22, pin: 5, activeLow: true }, 'light'),
  );
  assert.equal(clash.status, 400);
  assert.match(clash.json.error, /bridge-a/);
  assert.equal(
    (await api('PUT', '/api/actuators/bridge-a', body('bridge-a', { ...bridge, enable: 6 }))).status,
    200,
    'its own pins',
  );
  await api('DELETE', '/api/actuators/bridge-a');
});
