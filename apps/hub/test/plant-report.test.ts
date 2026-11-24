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
    headers: method === 'GET' ? {} : { 'content-type': 'application/json' },
    body: method === 'GET' ? undefined : JSON.stringify(body ?? {}),
  });
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : null };
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

before(async () => {
  hub = await startHub(
    loadConfig({ dbPath: ':memory:', httpPort: 0, mqttPort: 0, clientDir: '/nonexistent', timezone: 'UTC' }),
  );
  seedDemo(hub.store, 'pi-1');
  base = `http://127.0.0.1:${hub.httpPort}`;
});
after(() => hub.close());

test('placing a plant records the day it went into the pot', async () => {
  hub.store.putPlant({ id: 'tester', name: 'Tester', startedOn: daysAgo(20) });
  const placed = await api('POST', '/api/pots/pot-1/place', { plantId: 'tester' });
  assert.equal(placed.status, 200);
  assert.equal(placed.json.placedOn, daysAgo(0));
});

test("plant report: phases, its pot's readings in its time, statistics and markers", async () => {
  hub.store.putPlant({ ...hub.store.listPlants().find((p) => p.id === 'tester')!, placedOn: daysAgo(10) });
  const now = Date.now();
  // One EC reading from before the plant was placed (not counted), two during its time.
  hub.store.addReading({ probeId: 'pot-1-ec', value: 9, at: now - 15 * 86_400_000 });
  hub.store.addReading({ probeId: 'pot-1-ec', value: 1.0, at: now - 2 * 86_400_000 });
  hub.store.addReading({ probeId: 'pot-1-ec', value: 4.9, at: now - 1 * 86_400_000 });
  const { status, json } = await api('GET', '/api/plants/tester/report?range=all');
  assert.equal(status, 200);
  assert.equal(json.potId, 'pot-1');
  assert.equal(json.from, daysAgo(10));
  assert.ok(json.timeline.length >= 1 && json.timeline[0].from === daysAgo(10), JSON.stringify(json.timeline));
  assert.deepEqual(
    json.series.ec.map((r: { value: number }) => r.value),
    [1, 4.9],
  );
  assert.equal(json.stats.daysInTent, 10);
  assert.equal(typeof json.stats.ecInRange, 'number');
  assert.ok(json.markers.some((m: { kind: string; day: string }) => m.kind === 'placed' && m.day === daysAgo(10)));
  const week = await api('GET', '/api/plants/tester/report?range=week');
  assert.equal(week.json.from, daysAgo(6), 'the last 7 days, today included');
  assert.equal((await api('GET', '/api/plants/nope/report')).status, 404);
  assert.equal((await api('GET', '/api/plants/tester/report?range=year')).status, 400);
});
