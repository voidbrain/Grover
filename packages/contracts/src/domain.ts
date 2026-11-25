import { z } from 'zod';

import {
  ACTUATOR_KIND_IDS,
  OPERATING_MODES,
  PROBE_KIND_IDS,
  SUPPLY_TANKS,
  TANK_ROLES,
  calibrationProblem,
  isPump,
} from './kinds.ts';

/** What a probe measures. Units are fixed per kind (see PROBE_KINDS). */
export const ProbeKind = z.enum(PROBE_KIND_IDS);
export type ProbeKind = z.infer<typeof ProbeKind>;

/**
 * Hysteresis margin per probe kind (in the probe's units, F-008-T02): a threshold alert raised below `alertBelow`
 * (or above `alertAbove`) clears only once the reading is back past the threshold by at least this margin, so a
 * reading sitting at the threshold does not flap.
 */
export const ALERT_HYSTERESIS: Record<ProbeKind, number> = {
  air_temperature: 0.5,
  water_temperature: 0.5,
  water_level: 0.5,
  ph: 0.1,
  ec: 0.1,
};

/**
 * Effective hysteresis margin for a probe: `ALERT_HYSTERESIS[probe.kind]`, clamped to half the distance between
 * `alertBelow` and `alertAbove` when both thresholds are set so an active alert can always clear inside a narrow band.
 */
export function alertMargin(probe: Pick<Probe, 'kind' | 'alertBelow' | 'alertAbove'>): number {
  const base = ALERT_HYSTERESIS[probe.kind];
  if (probe.alertBelow !== null && probe.alertAbove !== null) {
    return Math.max(0, Math.min(base, (probe.alertAbove - probe.alertBelow) / 2));
  }
  return base;
}

export const ActuatorKind = z.enum(ACTUATOR_KIND_IDS);
export type ActuatorKind = z.infer<typeof ActuatorKind>;

/**
 * normal: everything runs.
 * silent: probes run, actuators stay off except lights.
 * off:    nothing runs; every actuator is forced off.
 */
export const OperatingMode = z.enum(OPERATING_MODES);
export type OperatingMode = z.infer<typeof OperatingMode>;

export const TankRole = z.enum(TANK_ROLES);

import { Id } from './ids.ts';
import { Calibration } from './calibration.ts';
export { Id };

/** How a probe is wired. The agent picks a driver from `driver`. */
export const ProbeBinding = z.discriminatedUnion('driver', [
  z.object({ driver: z.literal('mock') }),
  z.object({ driver: z.literal('ds18b20'), address: z.string().min(1) }),
  z.object({
    driver: z.literal('ads1115'),
    i2cBus: z.number().int().min(0).default(1),
    i2cAddress: z.number().int().min(0).max(127),
    channel: z.number().int().min(0).max(3),
  }),
  z.object({ driver: z.literal('hcsr04'), triggerPin: z.number().int(), echoPin: z.number().int() }),
]);
export type ProbeBinding = z.infer<typeof ProbeBinding>;

/** How an actuator is wired. */
export const ActuatorBinding = z.discriminatedUnion('driver', [
  z.object({ driver: z.literal('mock') }),
  z.object({ driver: z.literal('gpio'), pin: z.number().int(), activeLow: z.boolean().default(false) }),
  z.object({
    driver: z.literal('mcp23017'),
    i2cBus: z.number().int().min(0).default(1),
    i2cAddress: z.number().int().min(0).max(127),
    pin: z.number().int().min(0).max(15),
    activeLow: z.boolean().default(false),
  }),
  /**
   * A pump through an L298N motor bridge whose inputs are MCP23017 pins (F-018). Forward only: on is IN1 high with
   * IN2 low, off is every pin low; `enable` is the bridge's EN pin, or null when it is jumpered on the board.
   */
  z.object({
    driver: z.literal('l298n'),
    i2cBus: z.number().int().min(0).default(1),
    i2cAddress: z.number().int().min(0).max(127),
    in1: z.number().int().min(0).max(15),
    in2: z.number().int().min(0).max(15),
    enable: z.number().int().min(0).max(15).nullable().default(null),
  }),
]);
export type ActuatorBinding = z.infer<typeof ActuatorBinding>;

/** The pins a binding drives, as keys comparable across actuators of one agent (no two may share one). */
export function actuatorPins(b: ActuatorBinding): string[] {
  switch (b.driver) {
    case 'gpio':
      return [`GPIO ${b.pin}`];
    case 'mcp23017':
      return [`MCP23017 ${b.i2cBus}/0x${b.i2cAddress.toString(16)} pin ${b.pin}`];
    case 'l298n':
      return [b.in1, b.in2, ...(b.enable === null ? [] : [b.enable])].map(
        (p) => `MCP23017 ${b.i2cBus}/0x${b.i2cAddress.toString(16)} pin ${p}`,
      );
    case 'mock':
      return [];
  }
}

/** A room is one controlled space with one reservoir and one agent (Raspberry Pi). */
export const Room = z.object({
  id: Id,
  name: z.string().min(1),
  agentId: Id.nullable(),
  mode: OperatingMode,
  /** Start feeds by themselves when a pot runs low or its EC/pH leaves the phase range. Off by default. */
  autoFeed: z.boolean(),
  calendarId: Id.nullable(),
  /** Day 0 of the grow calendar (YYYY-MM-DD). */
  calendarStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
    .nullable(),
  /** Mixing tank level (probe units) at or below which it counts as empty. */
  mixEmptyLevel: z.number().min(0).default(1),
  /** Wait after mixing before the transfer, so the batch is even. */
  mixSettleSeconds: z.number().int().min(0).max(3600).default(60),
  /**
   * Who sets the light: the tent's own schedules, or the grow calendar (the followed plant's phase gives the hours,
   * from `lightStart`). With staggered pots the light follows `lightPlantId`, or the most advanced plant when null.
   */
  lightFrom: z.enum(['schedule', 'calendar']).default('schedule'),
  lightStart: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'HH:MM')
    .default('06:00'),
  lightPlantId: Id.nullable().default(null),
  /** The tent's tap water, measured once: the feed planner counts its dilution. */
  waterEc: z.number().min(0).max(5).default(0.3),
  waterPh: z.number().min(0).max(14).default(7),
  /** Least time between two automatic feeds of one pot. */
  feedCooldownMinutes: z.number().int().min(1).max(10080).default(60),
  /** Each supply tank's colour, like its real nutrient (F-017); a missing one takes the default. */
  tankColours: z
    .partialRecord(
      z.enum(SUPPLY_TANKS),
      z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/, '#rrggbb')
        .transform((c) => c.toLowerCase()),
    )
    .default({}),
});
export type Room = z.infer<typeof Room>;

export const Pot = z.object({
  id: Id,
  roomId: Id,
  name: z.string().min(1),
  /** Solution the pot holds when full: scales its pH correction. */
  liters: z.number().positive().default(10),
  /** Largest batch mixed for one feed. */
  feedLiters: z.number().positive().default(2),
  /** Litres per unit of the pot's level probe, to tell whether a batch fits. Null: unknown, trust the level range. */
  litersPerCm: z.number().positive().nullable().default(null),
});
export type Pot = z.infer<typeof Pot>;

export const Probe = z
  .object({
    id: Id,
    roomId: Id,
    potId: Id.nullable(),
    kind: ProbeKind,
    name: z.string().min(1),
    enabled: z.boolean(),
    binding: ProbeBinding,
    /** Level probes only: the tank it measures (null: the pot it belongs to). */
    tank: TankRole.nullable().default(null),
    /** Raise an alert below / above these values (for example a supply tank running low). */
    alertBelow: z.number().nullable().default(null),
    alertAbove: z.number().nullable().default(null),
    /** From driver units to the probe's (F-004). Null: readings are used as the driver gives them. */
    calibration: Calibration.nullable().default(null),
  })
  .superRefine((p, ctx) => {
    const problem = p.calibration && calibrationProblem(p.calibration, p.kind);
    if (problem) ctx.addIssue({ code: 'custom', message: problem, path: ['calibration', 'points'] });
  });
export type Probe = z.infer<typeof Probe>;

export const Actuator = z
  .object({
    id: Id,
    roomId: Id,
    potId: Id.nullable(),
    kind: ActuatorKind,
    name: z.string().min(1),
    enabled: z.boolean(),
    binding: ActuatorBinding,
    /** Hard cap enforced on the agent for any single run. Switches use 0 (no cap). */
    maxRunMs: z.number().int().min(0),
    /** Pumps only: calibrated flow, used to turn mL into ms. */
    mlPerSecond: z.number().positive().nullable(),
  })
  .refine((a) => !isPump(a.kind) || a.maxRunMs > 0, {
    message: 'a pump needs a run cap (maxRunMs above 0)',
    path: ['maxRunMs'],
  })
  .refine((a) => a.binding.driver !== 'l298n' || isPump(a.kind), {
    message: 'an L298N drives a pump; lights, fans and loops use a relay',
    path: ['binding'],
  })
  .refine(
    (a) => {
      if (a.binding.driver !== 'l298n') return true;
      const pins = [a.binding.in1, a.binding.in2, ...(a.binding.enable === null ? [] : [a.binding.enable])];
      return new Set(pins).size === pins.length;
    },
    { message: 'IN1, IN2 and EN are three different pins', path: ['binding'] },
  );
export type Actuator = z.infer<typeof Actuator>;

const HHMM = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'HH:MM');

/** When something happens. Times are local to the agent. */
export const ScheduleRule = z.discriminatedUnion('kind', [
  /** Keep a switch on between `from` and `to` (wraps midnight when to < from). */
  z.object({ kind: z.literal('window'), from: HHMM, to: HHMM }),
  /** Keep a switch off all day (a light in a phase with 0 light hours). */
  z.object({ kind: z.literal('dark') }),
  /** Fire at each listed time; actuators run for `durationMs`. */
  z.object({ kind: z.literal('at'), times: z.array(HHMM).min(1), durationMs: z.number().int().min(0).default(0) }),
  /** Fire every `everyMinutes` minutes, aligned to midnight. */
  z.object({
    kind: z.literal('every'),
    everyMinutes: z.number().int().min(1).max(1440),
    durationMs: z.number().int().min(0).default(0),
  }),
]);
export type ScheduleRule = z.infer<typeof ScheduleRule>;

export const Schedule = z.object({
  id: Id,
  target: z.discriminatedUnion('type', [
    z.object({ type: z.literal('probe'), probeId: Id }),
    z.object({ type: z.literal('actuator'), actuatorId: Id }),
  ]),
  rule: ScheduleRule,
  enabled: z.boolean(),
  /**
   * The weekdays it runs on (1 Monday … 7 Sunday, F-016); null: every day. A window past midnight belongs to the
   * day it started on.
   */
  days: z
    .array(z.number().int().min(1).max(7))
    .min(1)
    .max(7)
    .refine((d) => new Set(d).size === d.length, 'each day once')
    .nullable()
    .default(null),
});
export type Schedule = z.infer<typeof Schedule>;

/** mL per 10 L of reservoir. */
export const Dose = z.object({
  grow: z.number().min(0),
  micro: z.number().min(0),
  bloom: z.number().min(0),
  ripen: z.number().min(0),
  phDown: z.number().min(0),
});
export type Dose = z.infer<typeof Dose>;

const Range = z.object({ min: z.number(), max: z.number() }).refine((r) => r.min <= r.max, 'min must be <= max');

export const Phase = z.object({
  name: z.string().min(1),
  days: z.number().int().positive(),
  blooming: z.boolean(),
  flushing: z.boolean(),
  dose: Dose,
  ec: Range,
  ph: Range,
  waterTemp: Range,
  waterLevel: Range,
  /** Light window for the phase, e.g. 18/6 in veg, 12/12 in bloom. */
  lightHours: z.number().min(0).max(24),
});
export type Phase = z.infer<typeof Phase>;

export const Calendar = z.object({
  id: Id,
  name: z.string().min(1),
  phases: z.array(Phase).min(1),
});
export type Calendar = z.infer<typeof Calendar>;

export const Reading = z.object({
  probeId: Id,
  value: z.number().finite(),
  /** epoch ms, agent clock */
  at: z.number().int(),
});
export type Reading = z.infer<typeof Reading>;

export const ActuationSource = z.enum(['schedule', 'manual', 'feed', 'mcp', 'safety']);
export type ActuationSource = z.infer<typeof ActuationSource>;

export const Actuation = z.object({
  actuatorId: Id,
  state: z.enum(['on', 'off']),
  at: z.number().int(),
  /** Set on 'off' after a bounded run. */
  ranMs: z.number().int().min(0).nullable(),
  source: ActuationSource,
  commandId: z.string().nullable(),
});
export type Actuation = z.infer<typeof Actuation>;
