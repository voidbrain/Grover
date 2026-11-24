import type { Breeder, Medium, Plant, Strain } from '@grover/contracts';
import { optionalNumber } from './drafts';

/** Flat drafts for the plants page (numbers that may be empty are strings: '' = unknown). */

export interface BreederDraft {
  id: string;
  name: string;
  website: string;
  notes: string;
}
export const breederDraft = (b?: Breeder): BreederDraft => ({
  id: b?.id ?? '',
  name: b?.name ?? '',
  website: b?.website ?? '',
  notes: b?.notes ?? '',
});
export const toBreeder = (d: BreederDraft): Breeder => ({
  id: d.id,
  name: d.name.trim(),
  website: d.website.trim() === '' ? null : d.website.trim(),
  notes: d.notes.trim(),
});

export interface StrainDraft {
  id: string;
  name: string;
  breederId: string;
  parentIds: string[];
  sativaPercent: string;
  thcPercent: string;
  cbdPercent: string;
  floweringDays: string;
  autoflower: boolean;
  notes: string;
}
const text = (n: number | null | undefined) => (n == null ? '' : String(n));
export const strainDraft = (s?: Strain): StrainDraft => ({
  id: s?.id ?? '',
  name: s?.name ?? '',
  breederId: s?.breederId ?? '',
  parentIds: s?.parentIds ?? [],
  sativaPercent: text(s?.sativaPercent),
  thcPercent: text(s?.thcPercent),
  cbdPercent: text(s?.cbdPercent),
  floweringDays: text(s?.floweringDays),
  autoflower: s?.autoflower ?? false,
  notes: s?.notes ?? '',
});
export const toStrain = (d: StrainDraft): Strain => ({
  id: d.id,
  name: d.name.trim(),
  breederId: d.breederId || null,
  parentIds: d.parentIds.filter((p) => p !== d.id),
  sativaPercent: optionalNumber(d.sativaPercent),
  thcPercent: optionalNumber(d.thcPercent),
  cbdPercent: optionalNumber(d.cbdPercent),
  floweringDays: optionalNumber(d.floweringDays),
  autoflower: d.autoflower,
  notes: d.notes.trim(),
});

export interface PlantDraft {
  id: string;
  name: string;
  strainId: string;
  breederId: string;
  generation: number;
  motherId: string;
  potId: string;
  medium: '' | Medium;
  startedOn: string;
  placedOn: string;
  trimmedOn: string;
  bloomOn: string;
  flushOn: string;
  harvestedOn: string;
  yieldGrams: string;
  notes: string;
}
export const plantDraft = (p?: Plant): PlantDraft => ({
  id: p?.id ?? '',
  name: p?.name ?? '',
  strainId: p?.strainId ?? '',
  breederId: p?.breederId ?? '',
  generation: p?.generation ?? 0,
  motherId: p?.motherId ?? '',
  potId: p?.potId ?? '',
  medium: p?.medium ?? '',
  startedOn: p?.startedOn ?? '',
  placedOn: p?.placedOn ?? '',
  trimmedOn: p?.trimmedOn ?? '',
  bloomOn: p?.bloomOn ?? '',
  flushOn: p?.flushOn ?? '',
  harvestedOn: p?.harvestedOn ?? '',
  yieldGrams: text(p?.yieldGrams),
  notes: p?.notes ?? '',
});
const date = (s: string) => (s.trim() === '' ? null : s.trim());
export const toPlant = (d: PlantDraft): Plant => ({
  id: d.id,
  name: d.name.trim(),
  strainId: d.strainId || null,
  breederId: d.breederId || null,
  generation: d.generation,
  // A plant from seed has no mother plant.
  motherId: d.generation > 0 && d.motherId ? d.motherId : null,
  potId: d.potId || null,
  medium: d.medium || null,
  startedOn: date(d.startedOn),
  placedOn: date(d.placedOn),
  trimmedOn: date(d.trimmedOn),
  bloomOn: date(d.bloomOn),
  flushOn: date(d.flushOn),
  harvestedOn: date(d.harvestedOn),
  yieldGrams: optionalNumber(d.yieldGrams),
  notes: d.notes.trim(),
});
