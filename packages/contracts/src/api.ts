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

/** Something that needs the owner: a tank running low, a refused or aborted feed, an agent gone quiet. */
export interface Alert {
  /** Stable while the condition lasts, e.g. "probe:tank-water:below" or "feed:pot-2". */
  key: string;
  roomId: string;
  potId: string | null;
  level: 'warn' | 'bad';
  message: string;
  since: number;
}

export interface FeedView {
  feedId: string;
  roomId: string;
  potId: string;
  source: 'manual' | 'auto' | 'mcp';
  state: 'planned' | 'started' | 'done' | 'aborted' | 'refused';
  message: string;
  requestedAt: number;
  finishedAt: number | null;
  batchLiters: number | null;
  ml: Record<string, number> | null;
  ecBefore: number | null;
  phBefore: number | null;
  ecAfter: number | null;
  phAfter: number | null;
}

/** Live events pushed to clients over the hub WebSocket (/api/live). */
export type LiveEvent =
  | { type: 'reading'; reading: Reading }
  | { type: 'actuation'; actuation: Actuation }
  | { type: 'agent'; agent: AgentView }
  | { type: 'room'; roomId: string; mode: OperatingMode }
  | { type: 'fault'; agentId: string; subject: string; message: string; at: number }
  | { type: 'feed'; feed: FeedView }
  | { type: 'alert'; alert: Alert; cleared: boolean };
