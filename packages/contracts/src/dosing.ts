import type { Calendar, Phase } from './domain.ts';

/**
 * Dosing model. Linear and deliberately simple:
 *
 *   ΔEC = ecPerMlL · (mL nutrient / L of pot solution)
 *   ΔpH = −phPerMlL · (mL pH-down / L of pot solution)
 *
 * Coefficients are fitted per tent from past feeds (the pot's reading before a feed and the first one after it
 * mixed), by least squares through the origin, shrunk towards a prior so a handful of noisy samples cannot swing
 * them. The feed planner (feeding.ts) uses them for pH corrections.
 */
export interface DoseSample {
  /** mL added */
  ml: number;
  liters: number;
  /** Value before and after (EC for nutrients, pH for pH-down), after mixing. */
  before: number;
  after: number;
}

export interface DoseModel {
  ecPerMlL: number;
  phPerMlL: number;
  ecSamples: number;
  phSamples: number;
}

export const DOSE_PRIORS = { ecPerMlL: 0.4, phPerMlL: 2.0, weight: 4 } as const;

/** Least squares through the origin with a prior: k = (Σxy + w·k0·x̄²) / (Σx² + w·x̄²). */
export function fitCoefficient(
  samples: readonly { x: number; y: number }[],
  prior: number,
  weight: number = DOSE_PRIORS.weight,
): number {
  // A dose cannot move the value the wrong way: such a sample is probe noise or incomplete mixing.
  const usable = samples.filter((s) => s.x > 0 && Number.isFinite(s.y) && s.y > 0);
  if (usable.length === 0) return prior;
  const sxx = usable.reduce((a, s) => a + s.x * s.x, 0);
  const sxy = usable.reduce((a, s) => a + s.x * s.y, 0);
  const meanSq = sxx / usable.length;
  const k = (sxy + weight * prior * meanSq) / (sxx + weight * meanSq);
  return k;
}

export function fitModel(nutrient: readonly DoseSample[], phDown: readonly DoseSample[]): DoseModel {
  return {
    ecPerMlL: fitCoefficient(
      nutrient.map((s) => ({ x: s.ml / s.liters, y: s.after - s.before })),
      DOSE_PRIORS.ecPerMlL,
    ),
    phPerMlL: fitCoefficient(
      phDown.map((s) => ({ x: s.ml / s.liters, y: s.before - s.after })),
      DOSE_PRIORS.phPerMlL,
    ),
    ecSamples: nutrient.length,
    phSamples: phDown.length,
  };
}

/** Which phase is active `day` days after the calendar start (null before start or after the end). */
export function phaseForDay(
  calendar: Calendar,
  day: number,
): { phase: Phase; index: number; dayInPhase: number } | null {
  if (day < 0) return null;
  let start = 0;
  for (const [index, phase] of calendar.phases.entries()) {
    if (day < start + phase.days) return { phase, index, dayInPhase: day - start };
    start += phase.days;
  }
  return null;
}

/** The default calendar, from the original Grover tables; ripen alone at the end, then plain water. */
export const DEFAULT_CALENDAR: Calendar = {
  id: 'default',
  name: 'Default photoperiod',
  phases: [
    {
      name: 'Seedling',
      days: 14,
      blooming: false,
      flushing: false,
      lightHours: 18,
      dose: { grow: 5, micro: 5, bloom: 5, ripen: 0, phDown: 1 },
      ec: { min: 0.3, max: 1.2 },
      ph: { min: 5.5, max: 5.7 },
      waterTemp: { min: 15, max: 35 },
      waterLevel: { min: 10, max: 90 },
    },
    {
      name: 'Veg growth',
      days: 28,
      blooming: false,
      flushing: false,
      lightHours: 18,
      dose: { grow: 18, micro: 12, bloom: 6, ripen: 0, phDown: 1 },
      ec: { min: 1.3, max: 1.8 },
      ph: { min: 5.5, max: 6.0 },
      waterTemp: { min: 15, max: 35 },
      waterLevel: { min: 10, max: 90 },
    },
    {
      name: 'Early bloom',
      days: 14,
      blooming: true,
      flushing: false,
      lightHours: 12,
      dose: { grow: 20, micro: 20, bloom: 15, ripen: 0, phDown: 1 },
      ec: { min: 1.8, max: 2.0 },
      ph: { min: 5.7, max: 6.0 },
      waterTemp: { min: 15, max: 35 },
      waterLevel: { min: 10, max: 90 },
    },
    {
      name: 'Late bloom',
      days: 42,
      blooming: true,
      flushing: false,
      lightHours: 12,
      dose: { grow: 8, micro: 16, bloom: 24, ripen: 0, phDown: 1 },
      ec: { min: 1.4, max: 2.2 },
      ph: { min: 5.7, max: 6.2 },
      waterTemp: { min: 15, max: 35 },
      waterLevel: { min: 10, max: 90 },
    },
    {
      name: 'Ripen',
      days: 14,
      blooming: true,
      flushing: false,
      lightHours: 12,
      dose: { grow: 0, micro: 0, bloom: 0, ripen: 50, phDown: 1 },
      ec: { min: 1.6, max: 2.6 },
      ph: { min: 6.0, max: 6.4 },
      waterTemp: { min: 15, max: 35 },
      waterLevel: { min: 10, max: 90 },
    },
    {
      name: 'Flush',
      days: 7,
      blooming: true,
      flushing: true,
      lightHours: 12,
      dose: { grow: 0, micro: 0, bloom: 0, ripen: 0, phDown: 0 },
      ec: { min: 0, max: 0.6 },
      ph: { min: 6.0, max: 6.4 },
      waterTemp: { min: 15, max: 35 },
      waterLevel: { min: 10, max: 90 },
    },
  ],
};
