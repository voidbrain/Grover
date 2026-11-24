import { z } from 'zod';
import { Id } from './domain.ts';

/**
 * What grows: breeders, strains (with their ancestry) and plants (with their origin).
 *
 * A plant's generation counts cuttings: 0 grew from seed, 1 is a cutting of a generation-0 plant, 2 a cutting of a
 * cutting, and so on. `motherId` names the plant it was cut from, when that plant is recorded.
 */

const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD');
const Percent = z.number().min(0).max(100);

export const Breeder = z.object({
  id: Id,
  name: z.string().min(1),
  website: z.string().url().nullable().default(null),
  notes: z.string().default(''),
});
export type Breeder = z.infer<typeof Breeder>;

export const Strain = z.object({
  id: Id,
  name: z.string().min(1),
  breederId: Id.nullable().default(null),
  /** The strains it was bred from (its ancestry, one level; each parent has its own parents). */
  parentIds: z.array(Id).default([]),
  /** Sativa share; indica is the rest. Null when unknown. */
  sativaPercent: Percent.nullable().default(null),
  thcPercent: Percent.nullable().default(null),
  cbdPercent: Percent.nullable().default(null),
  floweringDays: z.number().int().positive().max(365).nullable().default(null),
  autoflower: z.boolean().default(false),
  /** Where the numbers come from (breeder page, lab test), and anything else. */
  notes: z.string().default(''),
});
export type Strain = z.infer<typeof Strain>;

export const Medium = z.enum(['hydro', 'soil', 'coco']);
export type Medium = z.infer<typeof Medium>;

export const Plant = z
  .object({
    id: Id,
    name: z.string().min(1),
    strainId: Id.nullable().default(null),
    /** Where the seed came from; defaults to the strain's breeder in the client. */
    breederId: Id.nullable().default(null),
    /** 0 from seed, 1 first cutting, 2 a cutting of a cutting… */
    generation: z.number().int().min(0).max(99).default(0),
    /** The plant it was cut from, when recorded. */
    motherId: Id.nullable().default(null),
    /** Where it grows now; null when not in a pot (a mother kept aside, harvested, imported). */
    potId: Id.nullable().default(null),
    medium: Medium.nullable().default(null),
    startedOn: IsoDate.nullable().default(null),
    /** The day it went into its pot in the tent (F-014); it started elsewhere on `startedOn`. */
    placedOn: IsoDate.nullable().default(null),
    trimmedOn: IsoDate.nullable().default(null),
    bloomOn: IsoDate.nullable().default(null),
    flushOn: IsoDate.nullable().default(null),
    harvestedOn: IsoDate.nullable().default(null),
    yieldGrams: z.number().min(0).nullable().default(null),
    notes: z.string().default(''),
  })
  .refine((p) => !p.placedOn || !p.startedOn || p.placedOn >= p.startedOn, {
    message: 'it went into the tent before it started',
    path: ['placedOn'],
  })
  .refine((p) => !p.placedOn || !p.harvestedOn || p.placedOn <= p.harvestedOn, {
    message: 'it went into the tent after its harvest',
    path: ['placedOn'],
  })
  .refine((p) => p.motherId !== p.id, { message: 'a plant cannot be its own mother', path: ['motherId'] })
  .refine((p) => p.motherId === null || p.generation > 0, {
    message: 'a plant from seed (generation 0) has no mother plant',
    path: ['generation'],
  });
export type Plant = z.infer<typeof Plant>;

/** Taking cuttings that would be past this generation is allowed, with a warning (the owner's limit, 2026-11-24). */
export const GENERATION_WARNING = 5;

export const CuttingsRequest = z.object({ count: z.number().int().min(1).max(20) });
export const HarvestRequest = z.object({
  date: IsoDate.optional(),
  yieldGrams: z.number().min(0).nullable().optional(),
});
export const PlaceRequest = z.object({ plantId: Id });
