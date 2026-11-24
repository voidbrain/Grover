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

// Review of #21: calibrations that would send wrong pH or EC to the feed planner are refused.
test('a pH probe needs two points; degenerate points are refused', () => {
  const base = {
    id: 'ph',
    roomId: 'r',
    potId: null,
    kind: 'ph',
    name: 'pH',
    enabled: true,
    binding: { driver: 'mock' },
  };
  assert.equal(
    Probe.safeParse({ ...base, calibration: { points: [point(2.03, 7)] } }).success,
    false,
    'pH 7 alone reads backwards',
  );
  assert.equal(Probe.safeParse({ ...base, calibration: { points: [point(2.53, 4), point(2.03, 7)] } }).success, true);
  assert.equal(Calibration.safeParse({ points: [point(2.03, 7), point(2.03, 4)] }).success, false, 'same raw twice');
  assert.equal(
    Calibration.safeParse({ points: [point(2.03, 7), point(2.031, 4)] }).success,
    false,
    'too close to fit a line',
  );
  assert.equal(
    Calibration.safeParse({ points: [point(0, 1.413)], compensation: 'ec' }).success,
    false,
    'EC through a zero reading',
  );
});

test('EC: a point taken away from 25 °C still reads the bottle value at that temperature', () => {
  // The bottle says 1.413 mS/cm at 25 °C; at 20 °C that solution conducts 1.413·0.9 and reads 0.855 V.
  const c = Calibration.parse({ points: [point(0.855, 1.413, 20)], compensation: 'ec' });
  assert.ok(Math.abs(applyCalibration(0.855, c, 20) - 1.413) < 0.002, `${applyCalibration(0.855, c, 20)}`);
  assert.ok(Math.abs(applyCalibration(0.95, c, 25) - 1.413) < 0.002, 'the same solution at 25 °C');
});

test('a temperature outside 0-50 °C is not used for compensation', () => {
  const c = Calibration.parse({ points: [point(2.53, 4), point(2.03, 7)], compensation: 'ph' });
  assert.equal(applyCalibration(2.53, c, -127), 4, 'a DS18B20 fault value');
  assert.equal(applyCalibration(2.53, c, 85), 4);
});
