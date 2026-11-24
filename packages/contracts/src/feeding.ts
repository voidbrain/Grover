import { z } from 'zod';
import type { ActuatorKind, Phase } from './domain.ts';
import { Id } from './domain.ts';
import type { DoseModel } from './dosing.ts';
import type { TankRoleId as TankRole } from './kinds.ts';

/**
 * A feed moves one batch of fresh solution into one pot:
 *
 *   supply tanks ──(water, grow, micro, bloom, ripen, pH-down pumps)──▶ mixing tank ──(pot's transfer pump)──▶ pot
 *
 * The hub plans it (`planFeed`, pure) and sends the plan as one command; the agent runs it step by step,
 * re-checking levels before each pump and during the transfer, and aborts with everything off on any failure.
 */

export const FeedSource = z.enum(['manual', 'auto', 'mcp']);
export type FeedSource = z.infer<typeof FeedSource>;

const LevelCheck = z.object({
  probeId: Id,
  /** Tank role or 'pot', for messages. */
  what: z.string(),
  /** Refuse when the level is below this (supply tanks) ... */
  min: z.number().nullable(),
  /** ... or above this (mixing tank must be empty, pot must have room). */
  max: z.number().nullable(),
});
export type LevelCheck = z.infer<typeof LevelCheck>;

export const FeedPlan = z.object({
  feedId: z.string(),
  potId: Id,
  /** Pump runs into the mixing tank, in order. Long runs are split to respect each pump's cap. */
  steps: z.array(
    z.object({
      actuatorId: Id,
      /** Tank role it draws from, for messages and the level re-check. */
      tank: z.string(),
      ml: z.number().positive(),
      durationMs: z.number().int().positive(),
    }),
  ),
  /** Checked before anything runs; supply checks are repeated before each step from that tank. */
  checks: z.array(LevelCheck),
  settleMs: z.number().int().min(0),
  transfer: z.object({
    actuatorId: Id,
    /** Total transfer time allowed. Runs in short slices, stopping early when the mixing tank is empty or the pot is full. */
    maxMs: z.number().int().positive(),
    sliceMs: z.number().int().positive(),
    mixProbeId: Id.nullable(),
    mixEmptyLevel: z.number(),
    potProbeId: Id.nullable(),
    potMaxLevel: z.number().nullable(),
  }),
});
export type FeedPlan = z.infer<typeof FeedPlan>;

export interface FeedPump {
  id: string;
  mlPerSecond: number | null;
  maxRunMs: number;
}

export interface FeedInput {
  feedId: string;
  phase: Phase;
  pot: { id: string; liters: number; feedLiters: number; litersPerCm: number | null };
  /** Latest fresh readings for this pot (its own probes, or the tent's shared pair). */
  potLevel: number | null;
  ec: number | null;
  ph: number | null;
  model: DoseModel;
  /** Room-level supply pumps by kind, and the pot's transfer pump. */
  pumps: Partial<Record<ActuatorKind, FeedPump>>;
  transfer: FeedPump | null;
  /** Level probes by tank role (supply and mix) and the pot's own level probe. */
  tankProbes: Partial<Record<TankRole, { id: string; alertBelow: number | null }>>;
  potLevelProbeId: string | null;
  mixEmptyLevel: number;
  settleSeconds: number;
  /** The tent's tap water. */
  waterEc: number;
  waterPh: number;
}

export type FeedDecision =
  | {
      ok: true;
      plan: FeedPlan;
      batchLiters: number;
      ml: Record<'water' | NutrientKey | 'phDown', number>;
      notes: string[];
      /** Pot volume before the feed and the EC / pH the model expects after it (null when unknown). */
      potLitersBefore: number;
      expected: { ec: number | null; ph: number | null };
    }
  | { ok: false; reason: string };

type NutrientKey = 'grow' | 'micro' | 'bloom' | 'ripen';
const NUTRIENTS: readonly NutrientKey[] = ['grow', 'micro', 'bloom', 'ripen'];
const KIND: Record<NutrientKey | 'phDown' | 'water', ActuatorKind> = {
  water: 'pump_water',
  grow: 'pump_grow',
  micro: 'pump_micro',
  bloom: 'pump_bloom',
  ripen: 'pump_ripen',
  phDown: 'pump_ph_down',
};
const TANK: Record<NutrientKey | 'phDown' | 'water', TankRole> = {
  water: 'water',
  grow: 'grow',
  micro: 'micro',
  bloom: 'bloom',
  ripen: 'ripen',
  phDown: 'ph_down',
};
const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;
const MIN_BATCH_L = 0.2;

/** Water carried with each additive into the mixing tank: concentrates never meet undiluted. */
const CARRIER_L = 0.1;
/** At most this much pH down per litre of pot solution in one feed, whatever the model says. */
const MAX_PH_DOWN_ML_PER_L = 0.5;
/** At most this many times the phase's full-strength dose for the pot's volume in one feed. */
const MAX_DOSE_FACTOR = 2;

/**
 * Plans one feed for one pot, or says why not. With V0 the pot's volume now and V1 = V0 + water:
 *
 * 1. Water: top the pot up to the phase's maximum level; more when its EC is above range and needs diluting
 *    (never more than the pot can take or one batch, `feedLiters`). Without a level reading only a small carrier
 *    batch is mixed.
 * 2. Nutrients: enough to take the pot from its EC after dilution to the middle of the EC range (DoseModel),
 *    split in the phase's grow:micro:bloom:ripen ratio. None while flushing. Without a fresh EC reading, the phase
 *    dose for the water added.
 * 3. pH down: from the pH expected after dilution and after the nutrients raise it, down to the middle of the
 *    pH range. None when that is already at or below it. Without a fresh pH reading, the phase's base amount.
 * 4. The mixing tank gets water in portions between the additives (water, grow, water, micro, …, pH down,
 *    water), so concentrates never mix undiluted.
 */
export function planFeed(input: FeedInput): FeedDecision {
  const { phase, pot, model, waterEc, waterPh, ec, ph } = input;
  const notes: string[] = [];
  const mid = (r: { min: number; max: number }) => (r.min + r.max) / 2;
  const targetEc = mid(phase.ec);
  const targetPh = mid(phase.ph);

  // A level below 0 is noise or an uncalibrated probe: count it as empty, never as negative volume.
  const potLevel = input.potLevel === null ? null : Math.max(0, input.potLevel);
  if (potLevel !== null && potLevel >= phase.waterLevel.max)
    return { ok: false, reason: `pot is full (level ${potLevel}, phase maximum ${phase.waterLevel.max})` };
  const known = potLevel !== null && pot.litersPerCm !== null;
  const v0 = known ? potLevel! * pot.litersPerCm! : pot.liters;
  const room = known ? (phase.waterLevel.max - potLevel!) * pot.litersPerCm! : null;
  const capacity = Math.min(pot.feedLiters, room ?? pot.feedLiters);
  if (!known) notes.push('no pot level (or litres per cm): volume taken as full, only a small carrier batch');

  // 1. Water.
  let water = room ?? 0;
  if (!phase.flushing && ec !== null && ec > phase.ec.max) {
    if (targetEc > waterEc) {
      const dilute = (v0 * (ec - targetEc)) / (targetEc - waterEc);
      if (dilute > water) water = dilute;
      notes.push(`EC ${ec} above ${phase.ec.max}: water to dilute`);
    } else notes.push(`EC ${ec} above ${phase.ec.max} and tap water cannot bring it down`);
  }
  if (water > capacity) {
    notes.push(
      `water limited to ${round1(capacity)} L (${capacity === pot.feedLiters ? 'one batch' : 'what the pot can take'})`,
    );
    water = capacity;
  }

  // 2. Nutrients, for a given amount of water.
  const doseTotal = NUTRIENTS.reduce((a, n) => a + phase.dose[n], 0);
  const nutrientFor = (w: number): number => {
    if (phase.flushing || doseTotal <= 0) return 0;
    if (ec === null) return (doseTotal * w) / 10;
    const v1 = v0 + w;
    if (v1 <= 0) return 0;
    const blend = (ec * v0 + waterEc * w) / v1;
    const n = Math.max(0, ((targetEc - blend) * v1) / model.ecPerMlL);
    return Math.min(n, (MAX_DOSE_FACTOR * doseTotal * v1) / 10);
  };
  let nutrient = nutrientFor(water);
  // Every additive travels with some water; make room for it.
  const additives = (n: number, p: boolean) => NUTRIENTS.filter((k) => phase.dose[k] > 0 && n > 0).length + (p ? 1 : 0);
  const carrierFor = (count: number) => (count > 0 ? CARRIER_L * (count + 1) : 0);
  const ensureCarrier = (count: number): FeedDecision | null => {
    const need = carrierFor(count);
    if (water >= need) return null;
    if (need > capacity)
      return { ok: false, reason: `the pot can take only ${round1(capacity)} L, not enough to carry the additives` };
    water = need;
    nutrient = nutrientFor(water);
    return null;
  };
  const early = ensureCarrier(additives(nutrient, false));
  if (early) return early;

  // 3. pH down.
  const phDownFor = (w: number, n: number): number => {
    if (phase.flushing) return 0;
    if (ph === null) return (phase.dose.phDown * w) / 10;
    const v1 = v0 + w;
    if (v1 <= 0) return 0;
    const expected = (ph * v0 + waterPh * w) / v1 + (model.phRisePerMlL * n) / v1;
    if (expected <= targetPh) return 0;
    return Math.min(((expected - targetPh) * v1) / model.phDownPerMlL, MAX_PH_DOWN_ML_PER_L * v1);
  };
  let phDown = phDownFor(water, nutrient);
  if (phDown > 0) {
    const late = ensureCarrier(additives(nutrient, true));
    if (late) return late;
    phDown = phDownFor(water, nutrient);
  }

  const ml: Record<'water' | NutrientKey | 'phDown', number> = {
    water: 0,
    grow: 0,
    micro: 0,
    bloom: 0,
    ripen: 0,
    phDown: round1(phDown),
  };
  for (const k of NUTRIENTS) ml[k] = doseTotal > 0 ? round1((nutrient * phase.dose[k]) / doseTotal) : 0;
  const nutrientMl = NUTRIENTS.reduce((a, k) => a + ml[k], 0);
  ml.water = Math.max(0, Math.round(water * 1000 - nutrientMl - ml.phDown));
  if (water < MIN_BATCH_L && nutrientMl === 0 && ml.phDown === 0)
    return {
      ok: false,
      reason:
        !known && ec === null && ph === null
          ? 'no fresh readings for this pot: read its level, EC and pH first'
          : 'nothing to do: the pot is at its level and on target',
    };

  // Notes and the expected result.
  const v1 = v0 + water;
  if (v1 <= 0) return { ok: false, reason: 'the pot reads empty and no water would go in' };
  const expEc = ec === null ? null : round2((ec * v0 + waterEc * water) / v1 + (model.ecPerMlL * nutrientMl) / v1);
  const expPh =
    ph === null
      ? null
      : round2(
          (ph * v0 + waterPh * water) / v1 + (model.phRisePerMlL * nutrientMl - model.phDownPerMlL * ml.phDown) / v1,
        );
  if (phase.flushing) notes.push(`${phase.name}: plain water`);
  else if (ec === null) notes.push('no fresh EC reading: the phase dose for the water added');
  else if (nutrientMl > 0) notes.push(`nutrients to bring EC from ${ec} to ${round2(targetEc)}`);
  if (ph === null && !phase.flushing) notes.push('no fresh pH reading: the phase amount of pH down');
  else if (ml.phDown > 0) notes.push(`pH down for the nutrients' rise and ${ph}, aiming at ${round2(targetPh)}`);
  else if (expPh !== null && expPh < phase.ph.min)
    notes.push(`pH ${expPh} expected below range: no pH-up pump, check by hand`);
  if (ml.phDown >= round1(MAX_PH_DOWN_ML_PER_L * v1)) notes.push('pH down capped for one feed');

  // 4. Pump runs: water portions between the additives.
  const order = [...NUTRIENTS.filter((k) => ml[k] > 0), ...(ml.phDown > 0 ? (['phDown'] as const) : [])];
  const portions = order.length + 1;
  const sequence: { key: 'water' | NutrientKey | 'phDown'; ml: number }[] = [];
  for (const [i, key] of order.entries()) {
    sequence.push({ key: 'water', ml: Math.round(ml.water / portions) });
    sequence.push({ key, ml: ml[key] });
    if (i === order.length - 1)
      sequence.push({ key: 'water', ml: ml.water - Math.round(ml.water / portions) * order.length });
  }
  if (order.length === 0) sequence.push({ key: 'water', ml: ml.water });

  const steps: FeedPlan['steps'] = [];
  const checks: LevelCheck[] = [];
  for (const { key, ml: amount } of sequence) {
    if (amount <= 0) continue;
    const pump = input.pumps[KIND[key]];
    if (!pump)
      return {
        ok: false,
        reason: `needs ${amount} mL of ${TANK[key].replace('_', ' ')} but the tent has no ${KIND[key]} pump`,
      };
    if (!pump.mlPerSecond) return { ok: false, reason: `${pump.id} is not calibrated (mL per second)` };
    const total = Math.round((amount / pump.mlPerSecond) * 1000);
    const cap = pump.maxRunMs > 0 ? pump.maxRunMs : total;
    for (let left = total; left > 0; left -= cap) {
      const durationMs = Math.min(cap, left);
      steps.push({
        actuatorId: pump.id,
        tank: TANK[key],
        ml: round1((durationMs / 1000) * pump.mlPerSecond),
        durationMs,
      });
    }
    const probe = input.tankProbes[TANK[key]];
    if (probe && probe.alertBelow !== null && !checks.some((c) => c.probeId === probe.id))
      checks.push({ probeId: probe.id, what: TANK[key], min: probe.alertBelow, max: null });
  }

  const mixProbe = input.tankProbes.mix ?? null;
  if (mixProbe) checks.push({ probeId: mixProbe.id, what: 'mix', min: null, max: input.mixEmptyLevel });
  if (input.potLevelProbeId)
    checks.push({ probeId: input.potLevelProbeId, what: 'pot', min: null, max: phase.waterLevel.max });

  const transfer = input.transfer;
  if (!transfer) return { ok: false, reason: 'the pot has no transfer pump' };
  if (!transfer.mlPerSecond) return { ok: false, reason: `${transfer.id} is not calibrated (mL per second)` };
  const expectedMs = Math.max(1, Math.round(((water * 1000) / transfer.mlPerSecond) * 1000));
  const sliceMs = Math.max(500, Math.min(5000, transfer.maxRunMs > 0 ? transfer.maxRunMs : 5000));

  return {
    ok: true,
    batchLiters: round1(water),
    ml,
    notes,
    potLitersBefore: round1(v0),
    expected: { ec: expEc, ph: expPh },
    plan: {
      feedId: input.feedId,
      potId: pot.id,
      steps,
      checks,
      settleMs: input.settleSeconds * 1000,
      transfer: {
        actuatorId: transfer.id,
        maxMs: mixProbe ? Math.round(expectedMs * 1.5) : expectedMs,
        sliceMs,
        mixProbeId: mixProbe?.id ?? null,
        mixEmptyLevel: input.mixEmptyLevel,
        potProbeId: input.potLevelProbeId,
        potMaxLevel: input.potLevelProbeId ? phase.waterLevel.max : null,
      },
    },
  };
}

/** Why a pot needs a feed now, or null. Used by the hub's auto-feed. */
export function feedReason(phase: Phase, potLevel: number | null, ec: number | null, ph: number | null): string | null {
  if (potLevel !== null && potLevel < phase.waterLevel.min) return `level ${potLevel} below ${phase.waterLevel.min}`;
  if (!phase.flushing && ec !== null && ec < phase.ec.min) return `EC ${ec} below ${phase.ec.min}`;
  if (ph !== null && ph > phase.ph.max) return `pH ${ph} above ${phase.ph.max}`;
  return null;
}
