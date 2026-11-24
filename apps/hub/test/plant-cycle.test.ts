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

before(async () => {
  hub = await startHub(
    loadConfig({ dbPath: ':memory:', httpPort: 0, mqttPort: 0, clientDir: '/nonexistent', timezone: 'UTC' }),
  );
  seedDemo(hub.store, 'pi-1');
  base = `http://127.0.0.1:${hub.httpPort}`;
});
after(() => hub.close());

test('taking cuttings: the next generation, growing elsewhere, from today', async () => {
  const res = await api('POST', '/api/plants/nl5h-gen2/cuttings', { count: 3 });
  assert.equal(res.status, 200);
  assert.equal(res.json.plants.length, 3);
  assert.equal(res.json.warning, null);
  for (const p of res.json.plants) {
    assert.equal(p.generation, 3);
    assert.equal(p.motherId, 'nl5h-gen2');
    assert.equal(p.potId, null);
    assert.equal(p.strainId, 'northern-lights-5-x-haze');
    assert.equal(p.breederId, 'sensi-seeds');
    assert.equal(p.startedOn, daysAgo(0));
  }
  assert.equal(new Set(res.json.plants.map((p: any) => p.id)).size, 3, 'distinct ids');
  // Again: no id clash with the first batch.
  const more = await api('POST', '/api/plants/nl5h-gen2/cuttings', { count: 2 });
  assert.equal(more.status, 200);
  assert.equal(hub.store.listPlants().filter((p) => p.generation === 3).length, 5);
});

test('cuttings past generation 5 come with a warning', async () => {
  hub.store.putPlant({ id: 'old-line', name: 'Old line', generation: 5, strainId: 'northern-lights-5-x-haze' });
  const res = await api('POST', '/api/plants/old-line/cuttings', { count: 1 });
  assert.equal(res.status, 200);
  assert.match(res.json.warning, /generation 6 is past 5/);
});

test('a pot holds one growing plant; harvest frees it for the next', async () => {
  const cutting = hub.store.listPlants().find((p) => p.generation === 3)!;
  const busy = await api('POST', '/api/pots/pot-3/place', { plantId: cutting.id });
  assert.equal(busy.status, 400);
  assert.match(busy.json.error, /already holds NL5xHaze gen 2/);
  const harvested = await api('POST', '/api/plants/nl5h-gen2/harvest', { yieldGrams: 120 });
  assert.equal(harvested.status, 200);
  assert.equal(harvested.json.harvestedOn, daysAgo(0));
  assert.equal(harvested.json.potId, 'pot-3', 'keeps its pot as history');
  assert.equal((await api('POST', '/api/plants/nl5h-gen2/harvest', {})).status, 400, 'not twice');
  const placed = await api('POST', '/api/pots/pot-3/place', { plantId: cutting.id });
  assert.equal(placed.status, 200);
  assert.equal(hub.store.plantInPot('pot-3')!.id, cutting.id);
  assert.equal(
    (await api('POST', '/api/pots/pot-3/place', { plantId: 'nl5h-gen2' })).status,
    400,
    'harvested plants stay out',
  );
});

test('each pot is fed for its own plant: staggered pots, different phases', async () => {
  // Tent calendar: day 20 = Veg growth. Pot 1 gets a plant that switched to bloom 20 days ago.
  hub.store.putPlant({
    id: 'bloomer',
    name: 'Bloomer',
    strainId: 'northern-lights-5-x-haze',
    generation: 1,
    potId: 'pot-1',
    startedOn: daysAgo(70),
    bloomOn: daysAgo(20),
  });
  const snap = (await api('GET', '/api/snapshot')).json;
  assert.equal(snap.potPhases['pot-1'].phase.name, 'Late bloom');
  assert.equal(snap.potPhases['pot-1'].source, 'plant');
  assert.equal(snap.potPhases['pot-3'].phase.name, 'Seedling', 'the cutting placed today');
  assert.equal(snap.potPhases['pot-2'].source, 'tent', 'an empty pot follows the tent');
  assert.equal(snap.potPhases['pot-2'].phase.name, 'Veg growth');
  // The feed plan for pot 1 uses Late bloom's dose (grow:micro:bloom = 8:16:24).
  for (const [probe, value] of [
    ['pot-1-level', 20],
    ['pot-1-ec', 1.0],
    ['pot-1-ph', 6.0],
  ] as const)
    hub.store.addReading({ probeId: probe, value, at: Date.now() });
  const preview = (await api('GET', '/api/pots/pot-1/feed')).json;
  assert.equal(preview.ok, true, JSON.stringify(preview));
  assert.ok(preview.ml.bloom > preview.ml.micro && preview.ml.micro > preview.ml.grow, JSON.stringify(preview.ml));
});

test('cuttings of a strain with a long name: distinct ids and names, and it returns (no endless loop)', async () => {
  hub.store.putStrain({ id: 'long-one', name: 'Northern Lights number five crossed with Original Haze' });
  hub.store.putPlant({ id: 'long-mother', name: 'Long mother', strainId: 'long-one', generation: 2 });
  const first = await api('POST', '/api/plants/long-mother/cuttings', { count: 1 });
  const more = await api('POST', '/api/plants/long-mother/cuttings', { count: 2 });
  assert.equal(first.status, 200);
  assert.equal(more.status, 200);
  const cuts = hub.store.listPlants().filter((p) => p.motherId === 'long-mother');
  assert.equal(new Set(cuts.map((p) => p.id)).size, 3, 'distinct ids');
  assert.deepEqual(
    cuts.map((p) => p.name.match(/#(\d+)$/)![1]).sort(),
    ['1', '2', '3'],
    'numbered 1, 2, 3 across calls',
  );
  for (const p of cuts)
    assert.ok(p.id.endsWith(`-${p.name.match(/#(\d+)$/)![1]}`), `id ${p.id} matches name ${p.name}`);
});

test('a harvest date in the future is refused', async () => {
  hub.store.putPlant({ id: 'future', name: 'Future', generation: 0, potId: 'pot-2' });
  const res = await api('POST', '/api/plants/future/harvest', { date: '2999-01-01' });
  assert.equal(res.status, 400);
  assert.match(res.json.error, /future/);
});

test('an analog pH probe without calibration is not used to plan a feed, and the plan says why', async () => {
  const ph = hub.store.getProbe('pot-1-ph');
  hub.store.putProbe({
    ...ph,
    binding: { driver: 'ads1115', i2cBus: 1, i2cAddress: 0x48, channel: 0 },
    calibration: null,
  });
  hub.store.addReading({ probeId: 'pot-1-ph', value: 2.03, at: Date.now() }); // volts
  const preview = (await api('GET', '/api/pots/pot-1/feed')).json;
  assert.equal(preview.ph, null, 'volts are not a pH');
  const why = preview.ok ? preview.notes.join(' ') : preview.reason;
  assert.match(why, /not calibrated/);
  // Calibrated, it counts again.
  hub.store.putProbe({
    ...hub.store.getProbe('pot-1-ph'),
    calibration: {
      points: [
        { raw: 2.53, value: 4, tempC: null, takenOn: '2026-11-24' },
        { raw: 2.03, value: 7, tempC: null, takenOn: '2026-11-24' },
      ],
      compensation: 'ph',
      tempProbeId: null,
    },
  });
  hub.store.addReading({ probeId: 'pot-1-ph', value: 6.1, at: Date.now() + 1 });
  assert.equal((await api('GET', '/api/pots/pot-1/feed')).json.ph, 6.1);
});
