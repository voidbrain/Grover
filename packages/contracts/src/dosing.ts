import type { Calendar, Dose, Phase } from './domain.ts';

/**
 * Dosing model. Linear and deliberately simple:
 *
 *   ΔEC = ecPerMlL · (mL nutrient / L reservoir)
 *   ΔpH = −phPerMlL · (mL pH-down / L reservoir)
 *
 * Coefficients are fitted per room by least squares through the origin, shrunk towards a prior
 * so a handful of noisy samples cannot swing them. Corrections aim at the middle of the range,
 * are scaled down by `step` so the loop undershoots rather than overshoots, and are capped.
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

export interface CorrectionInput {
  phase: Phase;
  ec: number | null;
  ph: number | null;
  liters: number;
  model: DoseModel;
  /** Fraction of the computed correction to apply (0..1]. */
  step?: number;
  /** Cap per pump per correction, mL. */
  maxMlPerPump?: number;
}

export interface Correction {
  ml: { grow: number; micro: number; bloom: number; ripen: number; phDown: number };
  reason: string;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * One correction step. Nutrients go first: they move pH as well, so pH is only corrected
 * when EC is already in range (the next reading decides the next step).
 */
export function computeCorrection(input: CorrectionInput): Correction {
  const { phase, ec, ph, liters, model } = input;
  const step = input.step ?? 0.7;
  const cap = input.maxMlPerPump ?? 50;
  const none = { grow: 0, micro: 0, bloom: 0, ripen: 0, phDown: 0 };

  if (phase.flushing) return { ml: none, reason: `${phase.name}: flushing, no nutrients` };
  // Each step changes both values, so never dose on half the picture.
  if (ec === null || ph === null) return { ml: none, reason: 'needs fresh EC and pH readings' };

  if (ec < phase.ec.min) {
    const target = (phase.ec.min + phase.ec.max) / 2;
    const totalMl = ((target - ec) / model.ecPerMlL) * liters * step;
    const ratio = phase.dose;
    const sum = ratio.grow + ratio.micro + ratio.bloom + ratio.ripen;
    if (sum <= 0) return { ml: none, reason: `${phase.name}: EC low (${ec}) but the phase has no nutrient dose` };
    const part = (n: number) => Math.min(cap, round1((totalMl * n) / sum));
    return {
      ml: {
        ...none,
        grow: part(ratio.grow),
        micro: part(ratio.micro),
        bloom: part(ratio.bloom),
        ripen: part(ratio.ripen),
      },
      reason: `EC ${ec} below ${phase.ec.min}: aiming for ${round1(target)}`,
    };
  }

  if (ph > phase.ph.max) {
    const target = (phase.ph.min + phase.ph.max) / 2;
    const ml = Math.min(cap, round1(((ph - target) / model.phPerMlL) * liters * step));
    return { ml: { ...none, phDown: ml }, reason: `pH ${ph} above ${phase.ph.max}: aiming for ${round1(target)}` };
  }

  const notes: string[] = [];
  if (ec > phase.ec.max) notes.push(`EC ${ec} above ${phase.ec.max}: add water, nothing to dose`);
  if (ph < phase.ph.min) notes.push(`pH ${ph} below ${phase.ph.min}: no pH-up pump, check manually`);
  return { ml: none, reason: notes.join('; ') || 'in range' };
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

/** mL for a full fresh mix, per the phase dose (doses are mL per 10 L). */
export function freshMix(dose: Dose, liters: number): Dose {
  const f = liters / 10;
  return {
    grow: round1(dose.grow * f),
    micro: round1(dose.micro * f),
    bloom: round1(dose.bloom * f),
    ripen: round1(dose.ripen * f),
    phDown: round1(dose.phDown * f),
  };
}

/** The default calendar, from the original Grover tables. */
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
      flushing: true,
      lightHours: 12,
      dose: { grow: 0, micro: 0, bloom: 0, ripen: 50, phDown: 1 },
      ec: { min: 1.6, max: 2.6 },
      ph: { min: 6.0, max: 6.4 },
      waterTemp: { min: 15, max: 35 },
      waterLevel: { min: 10, max: 90 },
    },
  ],
};
