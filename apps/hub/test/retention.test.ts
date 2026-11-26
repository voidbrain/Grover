import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { openDb } from '../src/db.ts';
import { loadConfig } from '../src/config.ts';
import { startHub } from '../src/hub.ts';
import { READINGS_FULL_DAYS } from '../src/retention.ts';
import { Store } from '../src/store.ts';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
// Invented: a fixed "now" on an hour boundary, and readings every 5 minutes.
const NOW = Date.UTC(2026, 5, 1, 12);
const CUTOFF = NOW - READINGS_FULL_DAYS * DAY;

function fill(store: Store, probeId: string, from: number, to: number): void {
  for (let at = from; at < to; at += 5 * 60_000) store.addReading({ probeId, at, value: at / HOUR });
}
const times = (store: Store, probeId: string) =>
  store.readings(probeId, 0, Number.MAX_SAFE_INTEGER, 1e6).map((r) => r.at);

test('readings older than 30 days keep the first of each hour per probe; newer ones all stay', () => {
  const store = new Store(openDb(':memory:'));
  // Two hours before the cutoff and two after, for two probes.
  fill(store, 'ph-1', CUTOFF - 2 * HOUR, CUTOFF + 2 * HOUR);
  fill(store, 'ec-1', CUTOFF - 2 * HOUR, CUTOFF + 2 * HOUR);

  const removed = store.downsampleReadings(CUTOFF);

  assert.equal(removed, 2 * 2 * 11, 'eleven of each old hour’s twelve readings go, per probe');
  for (const probe of ['ph-1', 'ec-1']) {
    const kept = times(store, probe);
    assert.deepEqual(kept.slice(0, 2), [CUTOFF - 2 * HOUR, CUTOFF - HOUR], 'one reading, the hour’s first');
    assert.equal(kept.length, 2 + 24, 'every reading of the last 30 days stays');
    assert.equal(kept[2], CUTOFF);
  }
  // The kept reading keeps its own value.
  assert.equal(store.readings('ph-1', CUTOFF - HOUR, CUTOFF - HOUR)[0]?.value, (CUTOFF - HOUR) / HOUR);
  // Running again changes nothing; a replayed old reading goes again.
  assert.equal(store.downsampleReadings(CUTOFF), 0);
  store.addReading({ probeId: 'ph-1', at: CUTOFF - HOUR + 10 * 60_000, value: 1 });
  assert.equal(store.downsampleReadings(CUTOFF), 1);
  assert.equal(times(store, 'ph-1').length, 26);
});

test('an old hour with one reading keeps it, whatever minute it was taken', () => {
  const store = new Store(openDb(':memory:'));
  store.addReading({ probeId: 'ph-1', at: CUTOFF - 3 * HOUR + 47 * 60_000, value: 6.1 });
  store.addReading({ probeId: 'ph-1', at: CUTOFF - 3 * HOUR + 52 * 60_000, value: 6.2 });
  store.addReading({ probeId: 'ph-1', at: CUTOFF - HOUR + 30 * 60_000, value: 6.3 });
  assert.equal(store.downsampleReadings(CUTOFF), 1);
  assert.deepEqual(
    store.readings('ph-1', 0).map((r) => r.value),
    [6.1, 6.3],
  );
});

test('the hub downsamples readings when it starts', async () => {
  const dbPath = join(mkdtempSync(join(tmpdir(), 'grover-retention-')), 'hub.sqlite');
  const old = Date.now() - (READINGS_FULL_DAYS + 2) * DAY;
  const hourStart = old - (old % HOUR);
  const seeded = new Store(openDb(dbPath));
  seeded.addReading({ probeId: 'ph-1', at: hourStart, value: 6 });
  seeded.addReading({ probeId: 'ph-1', at: hourStart + 5 * 60_000, value: 6.1 });
  seeded.addReading({ probeId: 'ph-1', at: Date.now() - HOUR, value: 6.2 });
  seeded.addReading({ probeId: 'ph-1', at: Date.now() - HOUR + 5 * 60_000, value: 6.3 });
  seeded.db.close();

  const hub = await startHub(
    loadConfig({ dbPath, httpPort: 0, mqttPort: 0, clientDir: '/nonexistent', timezone: 'UTC' }),
  );
  try {
    assert.deepEqual(
      hub.store.readings('ph-1', 0).map((r) => r.value),
      [6, 6.2, 6.3],
    );
  } finally {
    await hub.close();
  }
});
