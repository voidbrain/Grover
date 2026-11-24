import { z } from 'zod';
import { Actuation, OperatingMode, Reading } from './domain.ts';
import { AgentStatus } from './mqtt.ts';
import type { PhaseSpan, PlantStats } from './plant-report.ts';

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
  /** Pot volume before the feed (L) and what the model expected after it. */
  potLitersBefore: number | null;
  expectedEc: number | null;
  expectedPh: number | null;
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

/** The plant page's time range (F-014): today, the last 7 or 30 days, or all its time in the tent. */
export const PlantReportRange = z.enum(['day', 'week', 'month', 'all']).default('all');
export type PlantReportRange = z.infer<typeof PlantReportRange>;

/** Everything the plant page shows (F-014), from `GET /api/plants/:id/report`. */
export interface PlantReport {
  plantId: string;
  /** Its pot (kept after harvest as history), or null if it never went into one. */
  potId: string | null;
  /** The days shown (inclusive), clamped to its time in the tent. */
  from: string;
  to: string;
  /** The same as instants in the grow's time zone: local midnight of `from`, and of the day after `to`. */
  fromMs: number;
  toMs: number;
  /** Its phases, each with its local-midnight bounds (`toMs`: the end of its last day). */
  timeline: (PhaseSpan & { fromMs: number; toMs: number })[];
  /** Its pot's readings over `from`–`to`, at most a few hundred points each. */
  series: Record<'level' | 'ec' | 'ph' | 'waterTemp', { at: number; value: number }[]>;
  /** Placed, bloom, flush and harvest days; feeds at their time. */
  markers: (
    | { kind: 'placed' | 'bloom' | 'flush' | 'harvest'; day: string; at: number }
    | { kind: 'feed'; at: number; state: FeedView['state'] }
  )[];
  /** Over its whole time in the tent, whatever the range. */
  stats: PlantStats;
  /** Its feeds over its whole time in the tent, newest first. */
  feeds: FeedView[];
  /** Its pot's open alerts while it grows there (none once harvested: they would be the next plant's). */
  alerts: Alert[];
}
