import type { Calendar, Phase } from './domain.ts';

/**
 * Dosing model, per tent, linear and deliberately simple. A feed adds W litres of tap water, N mL of nutrient
 * and P mL of pH down to a pot holding V0 litres; with V1 = V0 + W:
 *
 *   EC after = (EC0·V0 + ECwater·W) / V1  +  ecPerMlL · N / V1
 *   pH after = (pH0·V0 + pHwater·W) / V1  +  phRisePerMlL · N / V1  −  phDownPerMlL · P / V1
 *
 * The first term of each is plain dilution; nutrients raise EC and (usually) pH, pH down lowers pH.
 * Coefficients are fitted from finished feeds by least squares, shrunk towards priors so a handful of noisy
 * samples cannot swing them. The feed planner (feeding.ts) solves these for N and P.
 */
export interface FeedSample {
  /** Pot volume before, water added (L); nutrient and pH down added (mL). */
  v0: number;
  water: number;
  nutrientMl: number;
  phDownMl: number;
  waterEc: number;
  waterPh: number;
  ecBefore: number | null;
  ecAfter: number | null;
  phBefore: number | null;
  phAfter: number | null;
}

export interface DoseModel {
  ecPerMlL: number;
  phRisePerMlL: number;
  phDownPerMlL: number;
  ecSamples: number;
  phSamples: number;
}

export const DOSE_PRIORS = { ecPerMlL: 0.4, phRisePerMlL: 0.05, phDownPerMlL: 2.0, weight: 4 } as const;

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
  return (sxy + weight * prior * meanSq) / (sxx + weight * meanSq);
}

/**
 * Two coefficients at once, y = a·n − b·p, each shrunk towards its prior (ridge regression on the 2×2 normal equations).
 * Falls back to the priors when the data says something impossible (a < 0 or b ≤ 0).
 */
export function fitPh(
  samples: readonly { n: number; p: number; y: number }[],
  a0: number,
  b0: number,
  weight: number = DOSE_PRIORS.weight,
): { a: number; b: number } {
  const usable = samples.filter((s) => (s.n > 0 || s.p > 0) && Number.isFinite(s.y));
  if (usable.length === 0) return { a: a0, b: b0 };
  let snn = 0;
  let spp = 0;
  let snp = 0;
  let sny = 0;
  let spy = 0;
  for (const { n, p, y } of usable) {
    snn += n * n;
    spp += p * p;
    snp += n * p;
    sny += n * y;
    spy += p * y;
  }
  // One shrinkage per coefficient, scaled by its own regressor (as in fitCoefficient): a shared one would let
  // the much larger nutrient term set how hard pH down is pulled to its prior, and bias both.
  const la = (weight * snn) / usable.length || weight;
  const lb = (weight * spp) / usable.length || weight;
  // Solve for a and c = −b.
  const m11 = snn + la;
  const m22 = spp + lb;
  const r1 = sny + la * a0;
  const r2 = spy - lb * b0;
  const det = m11 * m22 - snp * snp;
  if (Math.abs(det) < 1e-12) return { a: a0, b: b0 };
  const a = (r1 * m22 - snp * r2) / det;
  const b = -((m11 * r2 - snp * r1) / det);
  return a >= 0 && b > 0 ? { a, b } : { a: a0, b: b0 };
}

export function fitModel(samples: readonly FeedSample[]): DoseModel {
  const ec: { x: number; y: number }[] = [];
  const ph: { n: number; p: number; y: number }[] = [];
  for (const s of samples) {
    const v1 = s.v0 + s.water;
    if (v1 <= 0) continue;
    if (s.nutrientMl > 0 && s.ecBefore !== null && s.ecAfter !== null)
      ec.push({ x: s.nutrientMl / v1, y: s.ecAfter - (s.ecBefore * s.v0 + s.waterEc * s.water) / v1 });
    if (s.phBefore !== null && s.phAfter !== null)
      ph.push({
        n: s.nutrientMl / v1,
        p: s.phDownMl / v1,
        y: s.phAfter - (s.phBefore * s.v0 + s.waterPh * s.water) / v1,
      });
  }
  const { a, b } = fitPh(ph, DOSE_PRIORS.phRisePerMlL, DOSE_PRIORS.phDownPerMlL);
  return {
    ecPerMlL: fitCoefficient(ec, DOSE_PRIORS.ecPerMlL),
    phRisePerMlL: a,
    phDownPerMlL: b,
    ecSamples: ec.length,
    phSamples: ph.length,
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

/**
 * Whole days between two calendar dates (YYYY-MM-DD), negative when `to` is before `from`. Callers pass today's
 * date in the grow's time zone (`localTime`), so a day starts at local midnight and DST changes do not matter.
 */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

export interface PlantDates {
  startedOn: string | null;
  bloomOn: string | null;
  flushOn: string | null;
}

/**
 * The phase a plant is in, from its own dates (F-013: pots can be staggered):
 * - before its bloom date: the non-flowering phases counted from its start, holding in the last one until the
 *   switch to flowering is recorded (the grower decides when);
 * - from its bloom date: the flowering phases counted from that date, then on into the flushing ones;
 * - from its flush date: the flushing phases counted from that date.
 * Null without a start date, or before it.
 */
export function phaseForPlant(
  calendar: Calendar,
  dates: PlantDates,
  today: string,
): { phase: Phase; index: number; dayInPhase: number; day: number } | null {
  if (!dates.startedOn) return null;
  const day = daysBetween(dates.startedOn, today);
  if (day < 0) return null;
  const indexed = calendar.phases.map((phase, index) => ({ phase, index }));
  const walk = (group: typeof indexed, elapsed: number) => {
    if (group.length === 0) return null;
    let start = 0;
    for (const g of group) {
      if (elapsed < start + g.phase.days) return { ...g, dayInPhase: elapsed - start, day };
      start += g.phase.days;
    }
    const last = group.at(-1)!;
    return { ...last, dayInPhase: elapsed - (start - last.phase.days), day };
  };
  const veg = indexed.filter((g) => !g.phase.blooming && !g.phase.flushing);
  const bloom = indexed.filter((g) => g.phase.blooming && !g.phase.flushing);
  const flush = indexed.filter((g) => g.phase.flushing);
  if (dates.flushOn && daysBetween(dates.flushOn, today) >= 0)
    // No flush phase in this calendar: hold in the last flowering phase, never back to the first.
    return walk(flush, daysBetween(dates.flushOn, today)) ?? walk(bloom, Number.MAX_SAFE_INTEGER);
  if (dates.bloomOn && daysBetween(dates.bloomOn, today) >= 0)
    return walk([...bloom, ...flush], daysBetween(dates.bloomOn, today));
  return walk(veg, day) ?? walk(indexed, day);
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
