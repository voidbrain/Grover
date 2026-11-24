import { z } from 'zod';
import { Actuation, OperatingMode, Reading } from './domain.ts';
import { AgentStatus } from './mqtt.ts';

/** HTTP API request bodies (hub). Shared by the client, MCP tools and NERV. */
export const RunRequest = z
  .object({
    durationMs: z.number().int().positive().optional(),
    ml: z.number().positive().optional(),
  })
  .refine((r) => (r.durationMs === undefined) !== (r.ml === undefined), 'give exactly one of durationMs or ml');
export type RunRequest = z.infer<typeof RunRequest>;

export const SwitchRequest = z.object({ on: z.boolean() });
export const ModeRequest = z.object({ mode: OperatingMode });

export const CommandResult = z.object({
  commandId: z.string(),
  ok: z.boolean(),
  error: z.string().nullable(),
  value: z.number().nullable(),
});
export type CommandResult = z.infer<typeof CommandResult>;

export interface AgentView {
  agentId: string;
  roomId: string | null;
  online: boolean;
  lastSeen: number | null;
  status: AgentStatus | null;
  configCurrent: boolean;
}

export interface DoseSuggestion {
  roomId: string;
  reason: string;
  /** mL per pump kind; empty when nothing is needed. */
  ml: Partial<Record<'pump_grow' | 'pump_micro' | 'pump_bloom' | 'pump_ripen' | 'pump_ph_down', number>>;
  target: { ec: { min: number; max: number }; ph: { min: number; max: number } } | null;
  observed: { ec: number | null; ph: number | null };
  model: { ecPerMl: number; phPerMl: number; samples: number };
}

/** Live events pushed to clients over the hub WebSocket (/api/live). */
export type LiveEvent =
  | { type: 'reading'; reading: Reading }
  | { type: 'actuation'; actuation: Actuation }
  | { type: 'agent'; agent: AgentView }
  | { type: 'room'; roomId: string; mode: OperatingMode }
  | { type: 'fault'; agentId: string; subject: string; message: string; at: number };
