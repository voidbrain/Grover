import { z } from 'zod';
import { Id } from './ids.ts';
import { COMPENSATION_TEMP_RANGE, calibrationProblem } from './kinds.ts';

export { applyCalibration, calibrationLine, calibrationProblem, calibrationTemp } from './kinds.ts';

/**
 * Probe calibration (F-004): from what the driver reads (volts for an ADS1115, °C for a DS18B20…) to the
 * probe's unit. Applied on the agent, so stored readings are already in units. The maths lives in kinds.ts
 * (zod-free) so the client preview runs the same code.
 */
export const CalibrationPoint = z.object({
  raw: z.number().finite(),
  value: z.number().finite(),
  /** Solution temperature when the point was taken (°C), if known. */
  tempC: z.number().min(COMPENSATION_TEMP_RANGE.min).max(COMPENSATION_TEMP_RANGE.max).nullable().default(null),
  takenOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
});
export type CalibrationPoint = z.infer<typeof CalibrationPoint>;

export const Calibration = z
  .object({
    points: z.array(CalibrationPoint).min(1).max(8),
    compensation: z.enum(['none', 'ph', 'ec']).default('none'),
    tempProbeId: Id.nullable().default(null),
    /** Set by the hub when the calibration changes: readings taken before it are in other units. */
    calibratedAt: z.number().int().nullable().default(null),
  })
  .superRefine((c, ctx) => {
    const problem = calibrationProblem(c);
    if (problem) ctx.addIssue({ code: 'custom', message: problem, path: ['points'] });
  });
export type Calibration = z.infer<typeof Calibration>;
