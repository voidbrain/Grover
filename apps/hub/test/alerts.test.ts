import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ALERT_HYSTERESIS, type LiveEvent } from '@grover/contracts';
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
  for (const kind of ['air_temperature', 'water_temperature', 'water_level', 'ph', 'ec'] as const) {
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
