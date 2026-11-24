import type { Actuator, ActuatorKind, OperatingMode, Pot, Probe, ProbeKind, Room, Schedule } from '@grover/contracts';
import type { TankRoleId } from '@grover/contracts/kinds';

/**
 * Forms edit flat drafts (strings, numbers, booleans), because a form field cannot change shape when the user
 * picks another driver or rule. These functions convert between drafts and entities. The result of `to…` is
 * not validated here: the setup pages check it with the contracts schema, and the hub checks it again.
 */

export const ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;

/** A readable id from a name: "Grow pump #2" → "grow-pump-2". */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

/** `base`, or `base-2`, `base-3`… whichever is not taken. */
export function uniqueId(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  const root = base || 'item';
  if (!used.has(root)) return root;
  for (let n = 2; ; n++) if (!used.has(`${root}-${n}`)) return `${root}-${n}`;
}

/** "0x20", "32" → 32. NaN for anything else. */
export function parseI2cAddress(text: string): number {
  const t = text.trim().toLowerCase();
  if (/^0x[0-9a-f]{1,2}$/.test(t)) return parseInt(t.slice(2), 16);
  if (/^\d{1,3}$/.test(t)) return Number(t);
  return NaN;
}

export const formatI2cAddress = (n: number): string => `0x${n.toString(16).padStart(2, '0')}`;

const orNull = (s: string): string | null => (s.trim() === '' ? null : s.trim());

// ── room ───────────────────────────────────────────────────────────────────

export interface RoomDraft {
  id: string;
  name: string;
  agentId: string;
  calendarId: string;
  calendarStart: string;
  autoFeed: boolean;
  mode: OperatingMode;
  mixEmptyLevel: number;
  mixSettleSeconds: number;
  feedCooldownMinutes: number;
  waterEc: number;
  waterPh: number;
}

export const roomDraft = (r?: Room): RoomDraft => ({
  id: r?.id ?? '',
  name: r?.name ?? '',
  agentId: r?.agentId ?? '',
  calendarId: r?.calendarId ?? '',
  calendarStart: r?.calendarStart ?? '',
  autoFeed: r?.autoFeed ?? false,
  mode: r?.mode ?? 'normal',
  mixEmptyLevel: r?.mixEmptyLevel ?? 1,
  mixSettleSeconds: r?.mixSettleSeconds ?? 60,
  feedCooldownMinutes: r?.feedCooldownMinutes ?? 60,
  waterEc: r?.waterEc ?? 0.3,
  waterPh: r?.waterPh ?? 7,
});

export const toRoom = (d: RoomDraft): Room => ({
  id: d.id,
  name: d.name.trim(),
  agentId: orNull(d.agentId),
  mode: d.mode,
  autoFeed: d.autoFeed,
  calendarId: orNull(d.calendarId),
  calendarStart: orNull(d.calendarId) ? orNull(d.calendarStart) : null,
  mixEmptyLevel: d.mixEmptyLevel,
  mixSettleSeconds: d.mixSettleSeconds,
  feedCooldownMinutes: d.feedCooldownMinutes,
  waterEc: d.waterEc,
  waterPh: d.waterPh,
});

// ── pot ────────────────────────────────────────────────────────────────────

export interface PotDraft {
  id: string;
  name: string;
  liters: number;
  feedLiters: number;
  /** 0 = unknown */
  litersPerCm: number;
}

export const potDraft = (p?: Pot): PotDraft => ({
  id: p?.id ?? '',
  name: p?.name ?? '',
  liters: p?.liters ?? 10,
  feedLiters: p?.feedLiters ?? 2,
  litersPerCm: p?.litersPerCm ?? 0,
});
export const toPot = (d: PotDraft, roomId: string): Pot => ({
  id: d.id,
  roomId,
  name: d.name.trim(),
  liters: d.liters,
  feedLiters: d.feedLiters,
  litersPerCm: d.litersPerCm > 0 ? d.litersPerCm : null,
});

/** "" → null, "12.5" → 12.5; NaN for anything else (the schema then refuses it). */
export const optionalNumber = (text: string): number | null => (text.trim() === '' ? null : Number(text.trim()));
export const NUMBER_TEXT = /^\s*(-?\d+(\.\d+)?)?\s*$/;

// ── probe ──────────────────────────────────────────────────────────────────

export type ProbeDriver = Probe['binding']['driver'];

export interface ProbeDraft {
  id: string;
  name: string;
  kind: ProbeKind;
  /** '' = the tent (not a pot) */
  potId: string;
  enabled: boolean;
  driver: ProbeDriver;
  address: string;
  i2cBus: number;
  i2cAddress: string;
  channel: number;
  triggerPin: number;
  echoPin: number;
  /** Level probes: '' = the pot (or tent) it belongs to, else a tank role. */
  tank: '' | TankRoleId;
  /** '' = no alert */
  alertBelow: string;
  alertAbove: string;
}

export function probeDraft(p?: Probe): ProbeDraft {
  const b = p?.binding;
  return {
    id: p?.id ?? '',
    name: p?.name ?? '',
    kind: p?.kind ?? 'water_temperature',
    potId: p?.potId ?? '',
    enabled: p?.enabled ?? true,
    driver: b?.driver ?? 'mock',
    address: b?.driver === 'ds18b20' ? b.address : '',
    i2cBus: b?.driver === 'ads1115' ? b.i2cBus : 1,
    i2cAddress: b?.driver === 'ads1115' ? formatI2cAddress(b.i2cAddress) : '0x48',
    channel: b?.driver === 'ads1115' ? b.channel : 0,
    triggerPin: b?.driver === 'hcsr04' ? b.triggerPin : 0,
    echoPin: b?.driver === 'hcsr04' ? b.echoPin : 0,
    tank: p?.tank ?? '',
    alertBelow: p?.alertBelow == null ? '' : String(p.alertBelow),
    alertAbove: p?.alertAbove == null ? '' : String(p.alertAbove),
  };
}

export function toProbe(d: ProbeDraft, roomId: string): Probe {
  const binding: Probe['binding'] =
    d.driver === 'ds18b20'
      ? { driver: 'ds18b20', address: d.address.trim() }
      : d.driver === 'ads1115'
        ? { driver: 'ads1115', i2cBus: d.i2cBus, i2cAddress: parseI2cAddress(d.i2cAddress), channel: d.channel }
        : d.driver === 'hcsr04'
          ? { driver: 'hcsr04', triggerPin: d.triggerPin, echoPin: d.echoPin }
          : { driver: 'mock' };
  const tank = d.kind === 'water_level' && d.tank !== '' ? d.tank : null;
  return {
    id: d.id,
    roomId,
    // A tank is the tent's, never a pot's.
    potId: tank ? null : orNull(d.potId),
    kind: d.kind,
    name: d.name.trim(),
    enabled: d.enabled,
    binding,
    tank,
    alertBelow: optionalNumber(d.alertBelow),
    alertAbove: optionalNumber(d.alertAbove),
  };
}

// ── actuator ───────────────────────────────────────────────────────────────

export type ActuatorDriver = Actuator['binding']['driver'];

export interface ActuatorDraft {
  id: string;
  name: string;
  kind: ActuatorKind;
  potId: string;
  enabled: boolean;
  driver: ActuatorDriver;
  pin: number;
  i2cBus: number;
  i2cAddress: string;
  activeLow: boolean;
  /** Pumps: hard cap per run, in seconds. */
  maxRunSeconds: number;
  /** Pumps: calibrated flow; 0 = not calibrated. */
  mlPerSecond: number;
}

export function actuatorDraft(a?: Actuator): ActuatorDraft {
  const b = a?.binding;
  return {
    id: a?.id ?? '',
    name: a?.name ?? '',
    kind: a?.kind ?? 'pump_grow',
    potId: a?.potId ?? '',
    enabled: a?.enabled ?? true,
    driver: b?.driver ?? 'mock',
    pin: b?.driver === 'gpio' || b?.driver === 'mcp23017' ? b.pin : 0,
    i2cBus: b?.driver === 'mcp23017' ? b.i2cBus : 1,
    i2cAddress: b?.driver === 'mcp23017' ? formatI2cAddress(b.i2cAddress) : '0x20',
    activeLow: b?.driver === 'gpio' || b?.driver === 'mcp23017' ? b.activeLow : false,
    maxRunSeconds: a ? a.maxRunMs / 1000 : 30,
    mlPerSecond: a?.mlPerSecond ?? 0,
  };
}

export function toActuator(d: ActuatorDraft, roomId: string, pump: boolean): Actuator {
  const binding: Actuator['binding'] =
    d.driver === 'gpio'
      ? { driver: 'gpio', pin: d.pin, activeLow: d.activeLow }
      : d.driver === 'mcp23017'
        ? {
            driver: 'mcp23017',
            i2cBus: d.i2cBus,
            i2cAddress: parseI2cAddress(d.i2cAddress),
            pin: d.pin,
            activeLow: d.activeLow,
          }
        : { driver: 'mock' };
  return {
    id: d.id,
    roomId,
    potId: orNull(d.potId),
    kind: d.kind,
    name: d.name.trim(),
    enabled: d.enabled,
    binding,
    maxRunMs: pump ? Math.round(d.maxRunSeconds * 1000) : 0,
    mlPerSecond: pump && d.mlPerSecond > 0 ? d.mlPerSecond : null,
  };
}

// ── schedule ───────────────────────────────────────────────────────────────

export interface ScheduleDraft {
  id: string;
  enabled: boolean;
  targetType: 'probe' | 'actuator';
  targetId: string;
  kind: 'window' | 'at' | 'every';
  from: string;
  to: string;
  /** "08:00, 20:00" */
  times: string;
  everyMinutes: number;
  durationSeconds: number;
}

export function scheduleDraft(s?: Schedule): ScheduleDraft {
  const r = s?.rule;
  return {
    id: s?.id ?? '',
    enabled: s?.enabled ?? true,
    targetType: s?.target.type ?? 'actuator',
    targetId: s ? (s.target.type === 'probe' ? s.target.probeId : s.target.actuatorId) : '',
    kind: r?.kind ?? 'window',
    from: r?.kind === 'window' ? r.from : '06:00',
    to: r?.kind === 'window' ? r.to : '00:00',
    times: r?.kind === 'at' ? r.times.join(', ') : '08:00',
    everyMinutes: r?.kind === 'every' ? r.everyMinutes : 5,
    durationSeconds: r && r.kind !== 'window' ? r.durationMs / 1000 : 0,
  };
}

export function toSchedule(d: ScheduleDraft): Schedule {
  const durationMs = Math.round(d.durationSeconds * 1000);
  const rule: Schedule['rule'] =
    d.kind === 'window'
      ? { kind: 'window', from: d.from, to: d.to }
      : d.kind === 'at'
        ? {
            kind: 'at',
            times: d.times
              .split(/[,\s]+/)
              .map((t) => t.trim())
              .filter(Boolean),
            durationMs,
          }
        : { kind: 'every', everyMinutes: d.everyMinutes, durationMs };
  const target: Schedule['target'] =
    d.targetType === 'probe' ? { type: 'probe', probeId: d.targetId } : { type: 'actuator', actuatorId: d.targetId };
  return { id: d.id, target, rule, enabled: d.enabled };
}

/** One line for a schedule list. */
export function describeRule(rule: Schedule['rule']): string {
  switch (rule.kind) {
    case 'window':
      return `on ${rule.from}–${rule.to}`;
    case 'at':
      return `at ${rule.times.join(', ')}${rule.durationMs ? ` for ${rule.durationMs / 1000} s` : ''}`;
    case 'every':
      return `every ${rule.everyMinutes} min${rule.durationMs ? ` for ${rule.durationMs / 1000} s` : ''}`;
  }
}

/** One line for the wiring column. */
export function probeWiring(b: Probe['binding']): string {
  switch (b.driver) {
    case 'ds18b20':
      return `DS18B20 ${b.address}`;
    case 'ads1115':
      return `ADS1115 ${formatI2cAddress(b.i2cAddress)} ch ${b.channel}`;
    case 'hcsr04':
      return 'HC-SR04 (unsupported)';
    case 'mock':
      return 'Simulated';
  }
}

export function actuatorWiring(b: Actuator['binding']): string {
  switch (b.driver) {
    case 'gpio':
      return `GPIO ${b.pin}${b.activeLow ? ' (active low)' : ''}`;
    case 'mcp23017':
      return `MCP23017 ${formatI2cAddress(b.i2cAddress)} pin ${b.pin}${b.activeLow ? ' (active low)' : ''}`;
    case 'mock':
      return 'Simulated';
  }
}

/** Zod-style issues to readable lines: "binding.address: Too small". */
export function issueLines(issues: readonly { path: readonly PropertyKey[]; message: string }[]): string[] {
  return issues.map((i) => (i.path.length ? `${i.path.map(String).join('.')}: ${i.message}` : i.message));
}
