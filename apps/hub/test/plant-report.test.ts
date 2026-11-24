import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { loadConfig } from '../src/config.ts';
import { openDb } from '../src/db.ts';
import { startHub, type RunningHub } from '../src/hub.ts';
import { PlantReports } from '../src/plant-report.ts';
import { seedDemo } from '../src/seed.ts';
import { Store } from '../src/store.ts';

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

test("days are the grow's local days: a reading just after local midnight counts for that day", () => {
  const store = new Store(openDb(':memory:'));
  seedDemo(store, 'pi-1');
  // Auckland is UTC+13 in January: local midnight of 2026-01-15 is 2026-01-14T11:00Z.
  const now = Date.parse('2026-01-20T00:00:00Z');
  const reports = new PlantReports(store, 'Pacific/Auckland', () => now);
  const p = store.listPlants().find((x) => x.id === 'nl5h-gen2')!;
  store.putPlant({ ...p, startedOn: '2026-01-15', placedOn: '2026-01-15' });
  store.addReading({ probeId: 'ec', value: 1.2, at: Date.parse('2026-01-14T11:30:00Z') }); // 00:30 local, the 15th
  store.addReading({ probeId: 'ec', value: 9, at: Date.parse('2026-01-14T10:30:00Z') }); // 23:30 local, the 14th
  const r = reports.report('nl5h-gen2', 'all');
  assert.equal(r.from, '2026-01-15');
  assert.equal(r.fromMs, Date.parse('2026-01-14T11:00:00Z'));
  assert.deepEqual(
    r.series.ec.map((x) => x.value),
    [1.2],
  );
  assert.equal(r.timeline[0]!.fromMs, r.fromMs);
  assert.equal(r.markers.find((m) => m.kind === 'placed')!.at, r.fromMs);
});

test("a harvested plant does not show the next plant's alerts; a disabled probe keeps its history", () => {
  const store = new Store(openDb(':memory:'));
  seedDemo(store, 'pi-1');
  const now = Date.parse('2026-02-01T12:00:00Z');
  const reports = new PlantReports(store, 'UTC', () => now);
  const p = store.listPlants().find((x) => x.id === 'nl5h-gen2')!;
  store.putPlant({ ...p, startedOn: '2026-01-01', placedOn: '2026-01-01', harvestedOn: '2026-01-20' });
  store.raiseAlert({
    key: 'probe:pot-3-level:below',
    roomId: 'grow-1',
    potId: 'pot-3',
    level: 'warn',
    message: 'low',
    since: now,
  });
  store.addReading({ probeId: 'ec', value: 1.1, at: Date.parse('2026-01-10T12:00:00Z') });
  store.putProbe({ ...store.getProbe('ec'), enabled: false });
  const r = reports.report('nl5h-gen2', 'all');
  assert.deepEqual(r.alerts, []);
  assert.deepEqual(
    r.series.ec.map((x) => x.value),
    [1.1],
  );
});

test('a report over half a year of 5-minute readings stays quick (the hub runs the broker too)', () => {
  const store = new Store(openDb(':memory:'));
  seedDemo(store, 'pi-1');
  const now = Date.parse('2026-07-01T12:00:00Z');
  const p = store.listPlants().find((x) => x.id === 'nl5h-gen2')!;
  store.putPlant({ ...p, startedOn: '2026-01-01', placedOn: '2026-01-01' });
  store.tx(() => {
    for (const id of ['ec', 'ph', 'pot-3-level'])
      for (let t = Date.parse('2026-01-01T00:00:00Z'); t < now; t += 300_000)
        store.addReading({ probeId: id, value: 1.2, at: t });
  });
  const reports = new PlantReports(store, 'Europe/Rome', () => now);
  const t0 = performance.now();
  reports.report('nl5h-gen2', 'all');
  reports.report('nl5h-gen2', 'week');
  const ms = performance.now() - t0;
  assert.ok(ms < 1500, `${Math.round(ms)} ms`);
});
