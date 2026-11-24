import { z } from 'zod';

import { ACTUATOR_KIND_IDS, OPERATING_MODES, PROBE_KIND_IDS } from './kinds.ts';

/** What a probe measures. Units are fixed per kind (see PROBE_KINDS). */
export const ProbeKind = z.enum(PROBE_KIND_IDS);
export type ProbeKind = z.infer<typeof ProbeKind>;

export const ActuatorKind = z.enum(ACTUATOR_KIND_IDS);
export type ActuatorKind = z.infer<typeof ActuatorKind>;

/**
 * normal: everything runs.
 * silent: probes run, actuators stay off except lights.
 * off:    nothing runs; every actuator is forced off.
 */
export const OperatingMode = z.enum(OPERATING_MODES);
export type OperatingMode = z.infer<typeof OperatingMode>;

export const Id = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9_-]*$/, 'lowercase id: a-z, 0-9, _ and -');

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
]);
export type ActuatorBinding = z.infer<typeof ActuatorBinding>;

/** A room is one controlled space with one reservoir and one agent (Raspberry Pi). */
export const Room = z.object({
  id: Id,
  name: z.string().min(1),
  agentId: Id.nullable(),
  mode: OperatingMode,
  /** Automatic pH / EC correction. Off by default: the hub only suggests doses. */
  autoDose: z.boolean(),
  /** Reservoir volume used to scale doses. */
  reservoirLiters: z.number().positive(),
  calendarId: Id.nullable(),
  /** Day 0 of the grow calendar (ISO date). */
  calendarStart: z.string().nullable(),
});
export type Room = z.infer<typeof Room>;

export const Pot = z.object({
  id: Id,
  roomId: Id,
  name: z.string().min(1),
});
export type Pot = z.infer<typeof Pot>;

export const Probe = z.object({
  id: Id,
  roomId: Id,
  potId: Id.nullable(),
  kind: ProbeKind,
  name: z.string().min(1),
  enabled: z.boolean(),
  binding: ProbeBinding,
});
export type Probe = z.infer<typeof Probe>;

export const Actuator = z.object({
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
});
export type Actuator = z.infer<typeof Actuator>;

const HHMM = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'HH:MM');

/** When something happens. Times are local to the agent. */
export const ScheduleRule = z.discriminatedUnion('kind', [
  /** Keep a switch on between `from` and `to` (wraps midnight when to < from). */
  z.object({ kind: z.literal('window'), from: HHMM, to: HHMM }),
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

export const ActuationSource = z.enum(['schedule', 'manual', 'auto_dose', 'mcp', 'safety']);
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
