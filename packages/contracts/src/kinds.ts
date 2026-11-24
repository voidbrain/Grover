import type { Plant, Strain } from './plants.ts';

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

/**
 * What a level probe measures: one of the supply tanks, the mixing tank, or (null) its pot.
 * Each supply tank feeds the mixing tank through the pump of the same role.
 */
export const TANK_ROLES = ['water', 'grow', 'micro', 'bloom', 'ripen', 'ph_down', 'mix'] as const;
export type TankRoleId = (typeof TANK_ROLES)[number];

export const TANK_TITLES: Record<TankRoleId, string> = {
  water: 'Water',
  grow: 'Grow',
  micro: 'Micro',
  bloom: 'Bloom',
  ripen: 'Ripen',
  ph_down: 'pH down',
  mix: 'Mixing tank',
};

/** The supply pump that empties each supply tank into the mixing tank. */
export const TANK_PUMP: Record<Exclude<TankRoleId, 'mix'>, ActuatorKindId> = {
  water: 'pump_water',
  grow: 'pump_grow',
  micro: 'pump_micro',
  bloom: 'pump_bloom',
  ripen: 'pump_ripen',
  ph_down: 'pump_ph_down',
};

/** A readable id from a name: "Northern Lights #5 x Haze" → "northern-lights-5-x-haze" (empty → "item"). */
export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'item'
  );
}

// ── Plants (zod-free helpers; the browser imports them from here) ─────────

/** "70 % sativa / 30 % indica", or null. */
export function geneticsLabel(sativaPercent: number | null): string | null {
  if (sativaPercent === null) return null;
  const s = Math.round(sativaPercent);
  return `${s} % sativa / ${100 - s} % indica`;
}

/** "from seed", "1st cutting", "2nd cutting", "11th cutting"… */
export function generationLabel(generation: number): string {
  if (generation === 0) return 'from seed';
  const v = generation % 100;
  const suffix = v >= 11 && v <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][generation % 10] ?? 'th');
  return `${generation}${suffix} cutting`;
}

/** The ancestry of a strain as a tree, cut at `depth` and safe against loops in the data. */
export interface StrainNode {
  strain: Strain;
  parents: StrainNode[];
}
export function ancestry(
  strainId: string,
  strains: readonly Strain[],
  depth = 4,
  seen = new Set<string>(),
): StrainNode | null {
  const strain = strains.find((s) => s.id === strainId);
  if (!strain || seen.has(strainId)) return null;
  const next = new Set(seen).add(strainId);
  return {
    strain,
    parents:
      depth <= 0
        ? []
        : strain.parentIds
            .map((id) => ancestry(id, strains, depth - 1, next))
            .filter((n): n is StrainNode => n !== null),
  };
}

/** The line of mothers of a plant, newest first (the plant itself excluded), safe against loops. */
export function lineage(plantId: string, plants: readonly Plant[]): Plant[] {
  const out: Plant[] = [];
  const seen = new Set([plantId]);
  let current = plants.find((p) => p.id === plantId)?.motherId ?? null;
  while (current && !seen.has(current)) {
    const mother = plants.find((p) => p.id === current);
    if (!mother) break;
    out.push(mother);
    seen.add(current);
    current = mother.motherId;
  }
  return out;
}
