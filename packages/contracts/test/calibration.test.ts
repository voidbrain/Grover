import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Calibration, Probe, applyCalibration, calibrationLine } from '../src/index.ts';

const point = (raw: number, value: number, tempC: number | null = 25) => ({ raw, value, tempC, takenOn: '2026-11-24' });

test('pH, two points: buffers 4 and 7 read back exactly, the line in between', () => {
  // A typical pH board: 2.03 V at pH 7, 2.53 V at pH 4 (higher voltage in acid).
  const c = Calibration.parse({ points: [point(2.53, 4), point(2.03, 7)], compensation: 'ph' });
  assert.equal(applyCalibration(2.53, c, 25), 4);
  assert.equal(applyCalibration(2.03, c, 25), 7);
  assert.ok(Math.abs(applyCalibration(2.2, c, 25) - 5.98) < 0.01);
  assert.ok(Math.abs(calibrationLine(c).slope + 6) < 1e-9, 'slope -6 pH per volt');
});

test('pH temperature compensation: pH 7 stays, the rest scales with absolute temperature', () => {
  const c = Calibration.parse({ points: [point(2.53, 4), point(2.03, 7)], compensation: 'ph' });
  assert.equal(applyCalibration(2.03, c, 15), 7, 'the isopotential point does not move');
  // At 15 °C a reading that means pH 4 at 25 °C is 7 - 3·298.15/288.15.
  assert.ok(Math.abs(applyCalibration(2.53, c, 15) - (7 - (3 * 298.15) / 288.15)) < 0.001);
  assert.equal(applyCalibration(2.53, c, null), 4, 'no temperature: no compensation');
});

test('EC, one point: scales through zero, referred to 25 °C', () => {
  // Calibration solution 1.413 mS/cm read as 0.95 V at 25 °C.
  const c = Calibration.parse({ points: [point(0.95, 1.413)], compensation: 'ec' });
  assert.equal(applyCalibration(0.95, c, 25), 1.413);
  assert.equal(applyCalibration(0, c, 25), 0);
  // The same solution at 20 °C conducts about 10 % less; compensation brings it back.
  const at20 = 0.95 * (1 + 0.02 * (20 - 25));
  assert.ok(Math.abs(applyCalibration(at20, c, 20) - 1.413) < 0.002);
});

test('one point without compensation is an offset (e.g. a thermometer that reads 0.4 °C high)', () => {
  const c = Calibration.parse({ points: [point(21.4, 21.0, null)] });
  assert.equal(applyCalibration(25.4, c, null), 25);
});

test('probes carry an optional calibration', () => {
  const base = {
    id: 'ph',
    roomId: 'r',
    potId: null,
    kind: 'ph',
    name: 'pH',
    enabled: true,
    binding: { driver: 'mock' },
  };
  assert.equal(Probe.parse(base).calibration, null);
  assert.equal(Probe.safeParse({ ...base, calibration: { points: [] } }).success, false, 'at least one point');
});
