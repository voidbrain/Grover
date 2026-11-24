/** Zod-free constants and helpers: safe for the browser bundle (`@grover/contracts/kinds`). */
export const PROBE_KIND_IDS = ['air_temperature', 'water_temperature', 'water_level', 'ph', 'ec'] as const;
export type ProbeKindId = (typeof PROBE_KIND_IDS)[number];

export const PROBE_KINDS: Record<ProbeKindId, { unit: string; min: number; max: number; title: string }> = {
  air_temperature: { unit: '°C', min: 0, max: 50, title: 'Air temperature' },
  water_temperature: { unit: '°C', min: 0, max: 50, title: 'Water temperature' },
  water_level: { unit: 'cm', min: 0, max: 100, title: 'Water level' },
  ph: { unit: 'pH', min: 0, max: 14, title: 'pH' },
  ec: { unit: 'mS/cm', min: 0, max: 5, title: 'EC' },
};

/**
 * - `switch` kinds (light, fan, water_loop) hold a state, usually driven by a time window.
 * - `pump` kinds run for a bounded duration and move a liquid.
 */
export const ACTUATOR_KIND_IDS = [
  'light',
  'fan',
  'water_loop',
  'pump_water',
  'pump_ph_down',
  'pump_grow',
  'pump_micro',
  'pump_bloom',
  'pump_ripen',
  'pump_transfer',
] as const;
export type ActuatorKindId = (typeof ACTUATOR_KIND_IDS)[number];

export const SWITCH_KINDS: readonly ActuatorKindId[] = ['light', 'fan', 'water_loop'];
export const isPump = (kind: ActuatorKindId): boolean => !SWITCH_KINDS.includes(kind);

/** Nutrient pumps, in the order a dose mixes them. */
export const NUTRIENT_PUMPS = ['pump_grow', 'pump_micro', 'pump_bloom', 'pump_ripen'] as const;
export type NutrientPump = (typeof NUTRIENT_PUMPS)[number];

export const OPERATING_MODES = ['normal', 'silent', 'off'] as const;
