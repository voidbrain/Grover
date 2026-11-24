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

/** The supply tanks (every tank but the mixing one). */
export const SUPPLY_TANKS = ['water', 'grow', 'micro', 'bloom', 'ripen', 'ph_down'] as const;
export type SupplyTankId = (typeof SUPPLY_TANKS)[number];

/**
 * Nutrient colours (F-017): owner data, like the real bottles, shown as swatches and bars next to their name (never
 * behind text). Not UI tokens; the defaults below are what a tent starts with.
 */
export const NUTRIENT_PALETTE: readonly { name: string; hex: string }[] = [
  { name: 'Blue', hex: '#5b9bd5' },
  { name: 'Green', hex: '#3a8f3e' },
  { name: 'Lime', hex: '#8bbf3c' },
  { name: 'Brown', hex: '#8a5a2b' },
  { name: 'Red', hex: '#b03a2e' },
  { name: 'Purple', hex: '#8e3b8f' },
  { name: 'Pink', hex: '#d16ba5' },
  { name: 'Amber', hex: '#c9871f' },
  { name: 'Yellow', hex: '#d9c22e' },
  { name: 'Grey', hex: '#9aa0a6' },
  { name: 'Black', hex: '#2b2b2b' },
];
export const DEFAULT_TANK_COLOURS: Record<SupplyTankId, string> = {
  water: '#5b9bd5',
  grow: '#3a8f3e',
  micro: '#8a5a2b',
  bloom: '#8e3b8f',
  ripen: '#c9871f',
  ph_down: '#9aa0a6',
};
/** A supply tank's colour in a tent: the owner's, else the default. */
export function tankColour(room: { tankColours?: Partial<Record<SupplyTankId, string>> }, tank: SupplyTankId): string {
  return room.tankColours?.[tank] ?? DEFAULT_TANK_COLOURS[tank];
}
/** The tank a feed's mL key (`grow`, `phDown`…) came from. */
export const doseTank = (key: string): SupplyTankId | null =>
  key === 'phDown' ? 'ph_down' : (SUPPLY_TANKS as readonly string[]).includes(key) ? (key as SupplyTankId) : null;

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

// ── Calibration maths (F-004; zod-free so the client preview is the agent's own) ─────────────

/** The shape the maths needs; the schema is `Calibration` in calibration.ts. */
export interface CalibrationData {
  points: readonly { raw: number; value: number; tempC: number | null }[];
  compensation: 'none' | 'ph' | 'ec';
}

/** A compensation temperature is used only inside this range: outside it is a sensor fault (a DS18B20 reads -127 or 85). */
export const COMPENSATION_TEMP_RANGE = { min: 0, max: 50 } as const;
/** An older water temperature is not used for compensation: the solution may have changed since. */
export const COMPENSATION_TEMP_MAX_AGE_MS = 15 * 60_000;
/** Two points closer than this (in driver units, e.g. volts) cannot fix a line. */
export const MIN_RAW_SPREAD = 0.05;
/** Reference solutions closer than this (pH 7 and 4, EC 1.413 and 12.88…) give too uncertain a slope. */
const MIN_VALUE_SPREAD: Record<string, number> = { ph: 1, ec: 0.1 };
/** The compensations each kind may use. EC is always referred to 25 °C (and through zero for one point). */
const COMPENSATIONS: Record<string, readonly CalibrationData['compensation'][]> = { ph: ['ph', 'none'], ec: ['ec'] };

export const usableTemp = (t: number | null | undefined): t is number =>
  typeof t === 'number' && Number.isFinite(t) && t >= COMPENSATION_TEMP_RANGE.min && t <= COMPENSATION_TEMP_RANGE.max;

const KELVIN = 273.15;
const ecAt = (value25: number, tempC: number) => value25 * (1 + 0.02 * (tempC - 25));

/**
 * Why these points cannot calibrate a probe of `kind`, or null. pH needs two buffers (one point would only shift
 * the line, and its electrode slope runs backwards); two or more points need a spread in raw and in value; EC
 * through one point needs a reading above zero.
 */
export function calibrationProblem(c: CalibrationData, kind?: string): string | null {
  const pts = c.points;
  if (!pts.length) return 'no points';
  if (kind !== undefined && !(COMPENSATIONS[kind] ?? ['none']).includes(c.compensation))
    return `a ${kind} probe cannot use ${c.compensation} compensation`;
  if (kind === 'ph' && pts.length < 2) return 'pH needs two buffers (pH 7 and pH 4)';
  if (pts.length === 1) {
    if (c.compensation === 'ec' && !(pts[0]!.raw > 0)) return 'an EC point needs a reading above zero';
    return null;
  }
  const raws = pts.map((p) => p.raw);
  const values = pts.map((p) => p.value);
  if (Math.max(...raws) - Math.min(...raws) < MIN_RAW_SPREAD)
    return `the points read almost the same (${Math.min(...raws)} to ${Math.max(...raws)}): use solutions further apart`;
  const spread = Math.max(...values) - Math.min(...values);
  if (spread === 0 || spread < (kind ? (MIN_VALUE_SPREAD[kind] ?? 0) : 0))
    return 'the reference solutions are too close together: use ones further apart (pH 7 and 4)';
  return null;
}

/**
 * The line value = slope·raw + intercept for the points.
 * - Two or more points: least squares. One point: EC scales through zero, anything else shifts by an offset.
 * - EC bottles state their value at 25 °C: a point taken at another temperature is fitted to what the solution
 *   conducts at that temperature, so compensation later brings it back to the bottle value.
 */
export function calibrationLine(c: CalibrationData): { slope: number; intercept: number } {
  const pts = c.points.map((p) => ({
    raw: p.raw,
    value: c.compensation === 'ec' && usableTemp(p.tempC) ? ecAt(p.value, p.tempC) : p.value,
  }));
  if (pts.length === 1) {
    const p = pts[0]!;
    if (c.compensation === 'ec') return { slope: p.raw !== 0 ? p.value / p.raw : 1, intercept: 0 };
    return { slope: 1, intercept: p.value - p.raw };
  }
  const n = pts.length;
  const mx = pts.reduce((a, p) => a + p.raw, 0) / n;
  const my = pts.reduce((a, p) => a + p.value, 0) / n;
  const sxx = pts.reduce((a, p) => a + (p.raw - mx) ** 2, 0);
  if (sxx === 0) return { slope: 1, intercept: my - mx };
  const slope = pts.reduce((a, p) => a + (p.raw - mx) * (p.value - my), 0) / sxx;
  return { slope, intercept: my - slope * mx };
}

/** Temperature the points were taken at (the mean of the usable ones), or 25 °C. */
export function calibrationTemp(c: CalibrationData): number {
  const temps = c.points.map((p) => p.tempC).filter(usableTemp);
  return temps.length ? temps.reduce((a, t) => a + t, 0) / temps.length : 25;
}

/**
 * A raw reading in the probe's unit. `tempC`: the solution's temperature now, when known (ignored outside
 * COMPENSATION_TEMP_RANGE); unknown, the solution is taken to be at the calibration temperature.
 * - 'ph': the electrode slope follows absolute temperature (Nernst), around pH 7;
 * - 'ec': referred to 25 °C at 2 % per °C.
 */
export function applyCalibration(raw: number, c: CalibrationData, tempC: number | null): number {
  const { slope, intercept } = calibrationLine(c);
  let value = slope * raw + intercept;
  const t = usableTemp(tempC) ? tempC : calibrationTemp(c);
  if (c.compensation === 'ph') value = 7 + (value - 7) * ((calibrationTemp(c) + KELVIN) / (t + KELVIN));
  else if (c.compensation === 'ec') value = value / (1 + 0.02 * (t - 25));
  return Math.round(value * 1000) / 1000;
}
