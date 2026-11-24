import { z } from 'zod';
import { Id } from './ids.ts';

/**
 * Probe calibration (F-004): from what the driver reads (volts for an ADS1115, °C for a DS18B20…) to the
 * probe's unit. Applied on the agent, so stored readings are already in units.
 *
 * - Two or more points: the least-squares line through them.
 * - One point: a correction. EC (compensation 'ec') scales through zero, anything else shifts by an offset.
 * - Compensation, with the temperature of `tempProbeId` when known:
 *   'ph': the electrode slope follows absolute temperature (Nernst), around pH 7;
 *   'ec': referred to 25 °C at 2 % per °C.
 */
export const CalibrationPoint = z.object({
  raw: z.number().finite(),
  value: z.number().finite(),
  /** Solution temperature when the point was taken (°C), if known. */
  tempC: z.number().finite().nullable().default(null),
  takenOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
});
export type CalibrationPoint = z.infer<typeof CalibrationPoint>;

export const Calibration = z.object({
  points: z.array(CalibrationPoint).min(1).max(8),
  compensation: z.enum(['none', 'ph', 'ec']).default('none'),
  tempProbeId: Id.nullable().default(null),
});
export type Calibration = z.infer<typeof Calibration>;

const KELVIN = 273.15;
const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;

/** The line value = slope·raw + intercept for the points (see above). */
export function calibrationLine(c: Calibration): { slope: number; intercept: number } {
  const pts = c.points;
  if (pts.length === 1) {
    const p = pts[0]!;
    if (c.compensation === 'ec') return { slope: p.raw !== 0 ? p.value / p.raw : 1, intercept: 0 };
    return { slope: 1, intercept: p.value - p.raw };
  }
  const n = pts.length;
  const mx = pts.reduce((a, p) => a + p.raw, 0) / n;
  const my = pts.reduce((a, p) => a + p.value, 0) / n;
  const sxx = pts.reduce((a, p) => a + (p.raw - mx) ** 2, 0);
  if (sxx === 0) return { slope: 1, intercept: my - mx };
  const slope = pts.reduce((a, p) => a + (p.raw - mx) * (p.value - my), 0) / sxx;
  return { slope, intercept: my - slope * mx };
}

/** Temperature the points were taken at (their mean), or 25 °C. */
export function calibrationTemp(c: Calibration): number {
  const temps = c.points.map((p) => p.tempC).filter((t): t is number => t !== null);
  return temps.length ? temps.reduce((a, t) => a + t, 0) / temps.length : 25;
}

/** A raw reading in the probe's unit. `tempC`: the solution's temperature now, when known. */
export function applyCalibration(raw: number, c: Calibration, tempC: number | null): number {
  const { slope, intercept } = calibrationLine(c);
  let value = slope * raw + intercept;
  if (tempC !== null && Number.isFinite(tempC)) {
    if (c.compensation === 'ph') value = 7 + (value - 7) * ((calibrationTemp(c) + KELVIN) / (tempC + KELVIN));
    else if (c.compensation === 'ec') value = value / (1 + 0.02 * (tempC - 25));
  }
  return round(value, 3);
}
