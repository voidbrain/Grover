import { z } from 'zod';

/** Ids of every stored thing: lowercase, readable, stable. */
export const Id = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9_-]*$/, 'lowercase id: a-z, 0-9, _ and -');
