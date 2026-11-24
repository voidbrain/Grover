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
}

export type FeedDecision =
  | {
      ok: true;
      plan: FeedPlan;
      batchLiters: number;
      ml: Record<'water' | NutrientKey | 'phDown', number>;
      notes: string[];
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
const MIN_BATCH_L = 0.2;

/**
 * Plans one feed for one pot, or says why not.
 *
 * - Batch: the pot's `feedLiters`, reduced to what the pot can take (from its level and `litersPerCm`).
 * - Nutrients: the phase dose (mL per 10 L) scaled to the batch; none when flushing or when the pot's EC is
 *   above range (the batch then dilutes); 25 % more when EC is below range.
 * - pH down: the phase's base amount for the batch, plus a correction of the pot's pH towards the middle of the
 *   range through the fitted model (70 % of it, so it undershoots); none when the pot's pH is below range.
 * - Water: the rest of the batch.
 */
export function planFeed(input: FeedInput): FeedDecision {
  const { phase, pot, model } = input;
  const notes: string[] = [];

  // How much the pot can take.
  let batch = pot.feedLiters;
  if (input.potLevel !== null && input.potLevel >= phase.waterLevel.max)
    return { ok: false, reason: `pot is full (level ${input.potLevel}, phase maximum ${phase.waterLevel.max})` };
  if (input.potLevel !== null && pot.litersPerCm !== null) {
    const room = (phase.waterLevel.max - input.potLevel) * pot.litersPerCm;
    if (room < batch) {
      batch = room;
      notes.push(`batch reduced to ${round1(room)} L: that is what the pot can take`);
    }
  }
  if (batch < MIN_BATCH_L) return { ok: false, reason: `pot can take only ${round1(batch)} L` };

  // Nutrients.
  const ml: Record<'water' | NutrientKey | 'phDown', number> = {
    water: 0,
    grow: 0,
    micro: 0,
    bloom: 0,
    ripen: 0,
    phDown: 0,
  };
  let factor = phase.flushing ? 0 : 1;
  if (phase.flushing) notes.push(`${phase.name}: plain water`);
  else if (input.ec !== null && input.ec > phase.ec.max) {
    factor = 0;
    notes.push(`EC ${input.ec} above ${phase.ec.max}: water only, to dilute`);
  } else if (input.ec !== null && input.ec < phase.ec.min) {
    factor = 1.25;
    notes.push(`EC ${input.ec} below ${phase.ec.min}: 25 % more nutrients`);
  } else if (input.ec === null && !phase.flushing) notes.push('no fresh EC reading: phase dose as is');
  for (const n of NUTRIENTS) ml[n] = round1(((phase.dose[n] * batch) / 10) * factor);

  // pH down.
  if (!phase.flushing) {
    if (input.ph !== null && input.ph < phase.ph.min)
      notes.push(`pH ${input.ph} below ${phase.ph.min}: no pH down (no pH-up pump)`);
    else {
      let phDown = (phase.dose.phDown * batch) / 10;
      if (input.ph !== null && input.ph > phase.ph.max) {
        const target = (phase.ph.min + phase.ph.max) / 2;
        phDown += ((input.ph - target) / model.phPerMlL) * (pot.liters + batch) * 0.7;
        notes.push(`pH ${input.ph} above ${phase.ph.max}: extra pH down`);
      }
      ml.phDown = round1(phDown);
    }
  }
  const additives = NUTRIENTS.reduce((a, n) => a + ml[n], 0) + ml.phDown;
  ml.water = Math.max(0, Math.round(batch * 1000 - additives));

  // Pumps and runs.
  const steps: FeedPlan['steps'] = [];
  const checks: LevelCheck[] = [];
  for (const key of ['water', ...NUTRIENTS, 'phDown'] as const) {
    if (ml[key] <= 0) continue;
    const pump = input.pumps[KIND[key]];
    if (!pump)
      return {
        ok: false,
        reason: `needs ${ml[key]} mL of ${TANK[key].replace('_', ' ')} but the tent has no ${KIND[key]} pump`,
      };
    if (!pump.mlPerSecond) return { ok: false, reason: `${pump.id} is not calibrated (mL per second)` };
    const total = Math.round((ml[key] / pump.mlPerSecond) * 1000);
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
    if (probe && probe.alertBelow !== null)
      checks.push({ probeId: probe.id, what: TANK[key], min: probe.alertBelow, max: null });
  }

  const mixProbe = input.tankProbes.mix ?? null;
  if (mixProbe) checks.push({ probeId: mixProbe.id, what: 'mix', min: null, max: input.mixEmptyLevel });
  if (input.potLevelProbeId)
    checks.push({ probeId: input.potLevelProbeId, what: 'pot', min: null, max: phase.waterLevel.max });

  const transfer = input.transfer;
  if (!transfer) return { ok: false, reason: 'the pot has no transfer pump' };
  if (!transfer.mlPerSecond) return { ok: false, reason: `${transfer.id} is not calibrated (mL per second)` };
  const expectedMs = Math.round(((batch * 1000) / transfer.mlPerSecond) * 1000);
  const sliceMs = Math.max(500, Math.min(5000, transfer.maxRunMs > 0 ? transfer.maxRunMs : 5000));

  return {
    ok: true,
    batchLiters: round1(batch),
    ml,
    notes,
    plan: {
      feedId: input.feedId,
      potId: pot.id,
      steps,
      checks,
      settleMs: input.settleSeconds * 1000,
      transfer: {
        actuatorId: transfer.id,
        // Without a mixing-tank level probe the time is all we have; with one, allow a margin and stop at empty.
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
