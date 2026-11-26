import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ALERT_HYSTERESIS, PROBE_KIND_IDS, type LiveEvent } from '@grover/contracts';
import { Alerts } from '../src/alerts.ts';
import { openDb } from '../src/db.ts';
import { Bus } from '../src/events.ts';
import { seedDemo } from '../src/seed.ts';
import { Store } from '../src/store.ts';

function rig() {
  const store = new Store(openDb(':memory:'));
  seedDemo(store, 'pi-1');
  const bus = new Bus();
  let clock = 1_000;
  const alerts = new Alerts(store, bus, () => clock);
  const events: Extract<LiveEvent, { type: 'alert' }>[] = [];
  bus.on((ev) => {
    if (ev.type === 'alert') events.push(ev);
  });
  const push = (probeId: string, value: number) => {
    clock += 1_000;
    const reading = { probeId, value, at: clock };
    store.addReading(reading);
    bus.emit({ type: 'reading', reading });
  };
  return { store, alerts, events, push };
}

test('threshold alerts have a positive hysteresis margin for every probe kind', () => {
  // The kinds come from the contract, so a new probe kind is checked without editing this test.
  assert.ok(PROBE_KIND_IDS.length > 0);
  assert.deepEqual(Object.keys(ALERT_HYSTERESIS).sort(), [...PROBE_KIND_IDS].sort());
  for (const kind of PROBE_KIND_IDS) {
    assert.ok(ALERT_HYSTERESIS[kind] > 0, kind);
  }
});

test('alertBelow: raises below the threshold, holds inside the hysteresis margin, and clears at threshold + margin', () => {
  const { alerts, events, push } = rig();
  // tank-grow is water_level with alertBelow: 3, margin 0.5 cm → clears at >= 3.5 cm.
  push('tank-grow', 3.0);
  assert.equal(alerts.list().length, 0, 'at the threshold: no alert');

  push('tank-grow', 2.9);
  assert.equal(alerts.list().length, 1);
  assert.equal(alerts.list()[0]!.key, 'probe:tank-grow:below');
  assert.equal(events.length, 1);
  assert.equal(events[0]!.cleared, false);
  const since = alerts.list()[0]!.since;

  // Reading rises back to the threshold and inside the margin [3.0, 3.5): alert holds without flapping.
  push('tank-grow', 3.0);
  assert.equal(alerts.list().length, 1, 'at the threshold: still held');
  push('tank-grow', 3.4);
  assert.equal(alerts.list().length, 1, 'inside the margin: still held');
  assert.equal(alerts.list()[0]!.since, since, 'original since preserved');
  assert.match(alerts.list()[0]!.message, /3\.4/, 'message reflects the latest reading');
  assert.equal(events.length, 1, 'no duplicate raise or premature clear event');

  // Reading reaches threshold + margin (3.5): alert clears.
  push('tank-grow', 3.5);
  assert.equal(alerts.list().length, 0, 'past the margin: cleared');
  assert.equal(events.length, 2);
  assert.equal(events[1]!.cleared, true);

  // Once cleared, a reading inside the margin (3.2) does not raise it again.
  push('tank-grow', 3.2);
  assert.equal(alerts.list().length, 0, 'above threshold after clear: stays clear');
});

test('alertAbove: raises above the threshold, holds inside the hysteresis margin, and clears at threshold - margin', () => {
  const { alerts, events, push } = rig();
  // air-temp is air_temperature with alertAbove: 32, margin 0.5 °C → clears at <= 31.5 °C.
  push('air-temp', 32.0);
  assert.equal(alerts.list().length, 0, 'at the threshold: no alert');

  push('air-temp', 32.2);
  assert.equal(alerts.list().length, 1);
  assert.equal(alerts.list()[0]!.key, 'probe:air-temp:above');
  assert.equal(events.length, 1);
  assert.equal(events[0]!.cleared, false);

  // Reading drops back to the threshold and inside the margin (31.5, 32.0]: alert holds.
  push('air-temp', 32.0);
  assert.equal(alerts.list().length, 1, 'at the threshold: still held');
  push('air-temp', 31.6);
  assert.equal(alerts.list().length, 1, 'inside the margin: still held');
  assert.match(alerts.list()[0]!.message, /31\.6/, 'message reflects the latest reading');
  assert.equal(events.length, 1);

  // Reading reaches threshold - margin (31.5): alert clears.
  push('air-temp', 31.5);
  assert.equal(alerts.list().length, 0, 'past the margin: cleared');
  assert.equal(events.length, 2);
  assert.equal(events[1]!.cleared, true);

  // Once cleared, a reading inside the margin (31.8) does not raise it again.
  push('air-temp', 31.8);
  assert.equal(alerts.list().length, 0, 'below threshold after clear: stays clear');
});

test('two-sided thresholds: margin is clamped to half the band so an active alert can always clear inside a narrow band', () => {
  const { store, alerts, push } = rig();
  // pH default hysteresis is 0.1, but with alertBelow: 5.8 and alertAbove: 5.9 (band 0.1), half-band is 0.05 -> clears at 5.85.
  store.putProbe({ ...store.getProbe('ph'), alertBelow: 5.8, alertAbove: 5.9 });
  push('ph', 5.75);
  assert.deepEqual(
    alerts.list().map((a) => a.key),
    ['probe:ph:below'],
  );
  push('ph', 5.82);
  assert.deepEqual(
    alerts.list().map((a) => a.key),
    ['probe:ph:below'],
    'inside the clamped margin: held',
  );
  push('ph', 5.85);
  assert.deepEqual(alerts.list(), [], 'at the middle of the narrow band: cleared without tripping above');
});

test('EC: the clear point is exact even when threshold + margin is not in binary floating point (0.2 + 0.1)', () => {
  const { store, alerts, events, push } = rig();
  store.putProbe({ ...store.getProbe('ec'), alertBelow: 0.2, alertAbove: 2.0 });
  push('ec', 0.1);
  assert.deepEqual(
    alerts.list().map((a) => a.key),
    ['probe:ec:below'],
  );
  push('ec', 0.29);
  assert.equal(alerts.list().length, 1, 'inside the margin: held');
  push('ec', 0.3);
  assert.deepEqual(alerts.list(), [], 'at threshold + margin (0.3 mS/cm): cleared');
  assert.deepEqual(
    events.map((e) => e.cleared),
    [false, true],
    'one raise and one clear: what NERV delivers',
  );
});

test('B-010: held threshold alerts state the value, threshold and clear point instead of claiming the value is past the threshold', () => {
  const { store, alerts, push } = rig();

  // Supply tank (alertBelow: 3, margin: 0.5 -> clear point 3.5): below vs held inside hysteresis margin.
  push('tank-grow', 2.9);
  assert.equal(
    alerts.list()[0]!.message,
    'Grow tank low (2.9, alert below 3): refill it. Feeds that need it are refused until then.',
  );
  push('tank-grow', 3.4);
  assert.equal(alerts.list()[0]!.message, 'Grow tank at 3.4 (threshold 3, alert held until at least 3.5): refill it.');
  push('tank-grow', 3.5);
  assert.deepEqual(alerts.list(), []);

  // Non-tank below alert with binary float sum at the clear point (0.2 + 0.1 = 0.3).
  store.putProbe({ ...store.getProbe('ec'), alertBelow: 0.2, alertAbove: 2.0 });
  push('ec', 0.1);
  assert.equal(alerts.list()[0]!.message, 'EC (shared) at 0.1, below 0.2.');
  push('ec', 0.25);
  assert.equal(alerts.list()[0]!.message, 'EC (shared) at 0.25 (threshold 0.2, alert held until at least 0.3).');
  push('ec', 0.3);
  assert.deepEqual(alerts.list(), []);

  // Above alert (air-temp alertAbove: 32, margin: 0.5 -> clear point 31.5): above vs held inside hysteresis margin.
  push('air-temp', 32.2);
  assert.equal(alerts.list()[0]!.message, 'Air temperature at 32.2, above 32.');
  push('air-temp', 31.6);
  assert.equal(alerts.list()[0]!.message, 'Air temperature at 31.6 (threshold 32, alert held until at most 31.5).');
  push('air-temp', 31.5);
  assert.deepEqual(alerts.list(), []);
});

test('B-010: threshold comparisons use a tolerance so floating-point noise at the threshold does not trip or misclassify alerts', () => {
  const { store, alerts, push } = rig();

  store.putProbe({ ...store.getProbe('ec'), alertBelow: 0.3, alertAbove: 0.3 });
  push('ec', 0.7 - 0.4);
  assert.deepEqual(alerts.list(), [], 'within tolerance below alertBelow: does not trip');
  push('ec', 0.1 + 0.2);
  assert.deepEqual(alerts.list(), [], 'within tolerance above alertAbove: does not trip');

  store.putProbe({ ...store.getProbe('ec'), alertBelow: 0.3, alertAbove: 2.0 });
  push('ec', 0.2);
  assert.equal(alerts.list()[0]!.message, 'EC (shared) at 0.2, below 0.3.');
  push('ec', 0.7 - 0.4);
  assert.equal(
    alerts.list()[0]!.message,
    'EC (shared) at 0.3 (threshold 0.3, alert held until at least 0.4).',
    'reading at the threshold within tolerance is held, not reported as below',
  );
});
