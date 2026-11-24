import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { loadConfig } from '../src/config.ts';
import { startHub, type RunningHub } from '../src/hub.ts';
import { seedDemo } from '../src/seed.ts';

let hub: RunningHub;
let base: string;
async function api(method: string, path: string, body?: unknown): Promise<{ status: number; json: any }> {
  const res = await fetch(base + path, {
    method,
    headers: method === 'GET' || method === 'DELETE' ? {} : { 'content-type': 'application/json' },
    body: method === 'GET' || method === 'DELETE' ? undefined : JSON.stringify(body ?? {}),
  });
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : null };
}
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
const lightRule = () => {
  const config = hub.agents.buildConfig('pi-1')!;
  const s = config.schedules.filter((x) => x.target.type === 'actuator' && x.target.actuatorId === 'light');
  assert.equal(s.length, 1, 'exactly one rule for the light');
  return s[0]!.rule;
};

before(async () => {
  hub = await startHub(
    loadConfig({ dbPath: ':memory:', httpPort: 0, mqttPort: 0, clientDir: '/nonexistent', timezone: 'UTC' }),
  );
  seedDemo(hub.store, 'pi-1');
  base = `http://127.0.0.1:${hub.httpPort}`;
});
after(() => hub.close());

test('the light follows the plant in the tent: 18 h in veg, 12 h after Switch to bloom', async () => {
  assert.deepEqual(lightRule(), { kind: 'window', from: '06:00', to: '00:00' });
  const snap = (await api('GET', '/api/snapshot')).json;
  assert.equal(snap.rooms[0].light.phaseName, 'Veg growth');
  assert.equal(snap.rooms[0].light.plantId, 'nl5h-gen2');
  const bloom = await api('POST', '/api/plants/nl5h-gen2/bloom');
  assert.equal(bloom.status, 200);
  assert.equal(bloom.json.bloomOn, new Date().toISOString().slice(0, 10));
  assert.deepEqual(lightRule(), { kind: 'window', from: '06:00', to: '18:00' });
  assert.equal((await api('POST', '/api/plants/nl5h-gen2/bloom')).status, 400, 'not twice');
});

test('staggered pots: the most advanced plant by default, a picked one when set', async () => {
  hub.store.putPlant({ id: 'young', name: 'Young', generation: 1, potId: 'pot-1', startedOn: daysAgo(3) });
  assert.equal(hub.lights.plan(hub.store.getRoom('grow-1'))!.plantId, 'nl5h-gen2', 'the flowering one is ahead');
  hub.store.putRoom({ ...hub.store.getRoom('grow-1'), lightPlantId: 'young' });
  assert.deepEqual(lightRule(), { kind: 'window', from: '06:00', to: '00:00' }, 'following the young one: 18 h');
  hub.store.putRoom({ ...hub.store.getRoom('grow-1'), lightPlantId: null, lightStart: '08:00' });
  assert.deepEqual(lightRule(), { kind: 'window', from: '08:00', to: '20:00' });
});

test('on its own schedules the tent keeps the light schedule it has', async () => {
  hub.store.putRoom({ ...hub.store.getRoom('grow-1'), lightFrom: 'schedule' });
  assert.deepEqual(lightRule(), hub.store.listSchedules().find((s) => s.id === 'light-veg')!.rule);
  assert.equal(hub.lights.plan(hub.store.getRoom('grow-1')), null);
  hub.store.putRoom({ ...hub.store.getRoom('grow-1'), lightFrom: 'calendar' });
});

test('a phase with no light keeps it dark; Start flush needs a bloom first', async () => {
  const cal = hub.store.getCalendar('default')!;
  hub.store.putCalendar({
    ...cal,
    phases: cal.phases.map((p) => (p.name === 'Early bloom' ? { ...p, lightHours: 0 } : p)),
  });
  hub.store.putRoom({ ...hub.store.getRoom('grow-1'), lightPlantId: 'nl5h-gen2' });
  assert.deepEqual(lightRule(), { kind: 'dark' });
  assert.equal((await api('POST', '/api/plants/young/flush')).status, 400);
  assert.equal((await api('POST', '/api/plants/nl5h-gen2/flush')).status, 200);
});
