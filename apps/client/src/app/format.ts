import type { Phase, ProbeKind } from '@grover/contracts';

/** Range a probe should sit in for the current phase, when the phase defines one. */
export function targetRange(kind: ProbeKind, phase: Phase | null): { min: number; max: number } | null {
  if (!phase) return null;
  switch (kind) {
    case 'ec':
      return phase.ec;
    case 'ph':
      return phase.ph;
    case 'water_temperature':
      return phase.waterTemp;
    case 'water_level':
      return phase.waterLevel;
    default:
      return null;
  }
}

export type Health = 'ok' | 'low' | 'high' | 'unknown' | 'stale';

export function health(
  value: number | undefined,
  range: { min: number; max: number } | null,
  at: number | undefined,
  now: number,
): Health {
  if (value === undefined || at === undefined) return 'unknown';
  if (now - at > 60 * 60_000) return 'stale';
  if (!range) return 'ok';
  return value < range.min ? 'low' : value > range.max ? 'high' : 'ok';
}

export function ago(at: number | undefined | null, now: number): string {
  if (at == null) return 'never';
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86_400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86_400)} d ago`;
}
