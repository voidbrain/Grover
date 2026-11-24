import { z } from 'zod';
import { Actuation, Actuator, ActuationSource, Id, OperatingMode, Probe, Reading, Schedule } from './domain.ts';
import { FeedPlan } from './feeding.ts';

/**
 * MQTT protocol between hub (broker) and agents.
 *
 *   grover/agents/{agentId}/status    agent → hub  retained; last will = offline
 *   grover/agents/{agentId}/events    agent → hub  readings and actuations, QoS 1
 *   grover/agents/{agentId}/config    hub → agent  retained; everything the agent needs to run alone
 *   grover/agents/{agentId}/commands  hub → agent  QoS 1
 *   grover/agents/{agentId}/acks      agent → hub  one per command
 *
 * Version 2 adds feeds (the `feed` command and event). Version 3 adds the `dark` schedule rule (F-007): an agent on
 * an older version refuses the config (a fault) and keeps running its previous one; update hub and agent together.
 *
 * Agents connect with username = agentId and password = agent token.
 */
export const PROTOCOL_VERSION = 3;

export const topics = {
  status: (agentId: string) => `grover/agents/${agentId}/status`,
  events: (agentId: string) => `grover/agents/${agentId}/events`,
  config: (agentId: string) => `grover/agents/${agentId}/config`,
  commands: (agentId: string) => `grover/agents/${agentId}/commands`,
  acks: (agentId: string) => `grover/agents/${agentId}/acks`,
} as const;

const TOPIC_RE = /^grover\/agents\/([a-z0-9][a-z0-9_-]*)\/(status|events|config|commands|acks)$/;
export type TopicKind = keyof typeof topics;

export function parseTopic(topic: string): { agentId: string; kind: TopicKind } | null {
  const m = TOPIC_RE.exec(topic);
  return m ? { agentId: m[1]!, kind: m[2] as TopicKind } : null;
}

export const AgentStatus = z.object({
  state: z.enum(['online', 'offline']),
  protocol: z.number().int(),
  version: z.string(),
  /** Hash of the config the agent is running, so the hub can tell it is current. */
  configHash: z.string().nullable(),
  mode: OperatingMode.nullable(),
  /** Actuators currently on. */
  active: z.array(Id),
  /** The feed the agent is running, if any: lets the hub close a feed it lost track of. */
  feed: z.string().nullable().default(null),
  /** Events still in the agent's outbox: until it is 0, a feed report may be on its way. */
  queued: z.number().int().min(0).default(0),
  at: z.number().int(),
});
export type AgentStatus = z.infer<typeof AgentStatus>;

/** Agent events carry a per-agent sequence number for ordering; the hub stores each event once (keyed by subject and time). */
export const AgentEvent = z.discriminatedUnion('type', [
  z.object({ type: z.literal('reading'), seq: z.number().int(), reading: Reading }),
  z.object({ type: z.literal('actuation'), seq: z.number().int(), actuation: Actuation }),
  z.object({
    type: z.literal('fault'),
    seq: z.number().int(),
    at: z.number().int(),
    subject: z.string(),
    message: z.string(),
  }),
  /** Progress of a feed: started, one line per step, then done or aborted (with the reason). */
  z.object({
    type: z.literal('feed'),
    seq: z.number().int(),
    at: z.number().int(),
    feedId: z.string(),
    potId: Id,
    state: z.enum(['started', 'step', 'done', 'aborted']),
    message: z.string(),
  }),
]);
export type AgentEvent = z.infer<typeof AgentEvent>;

/** Everything an agent needs to keep running without the hub. */
export const AgentConfig = z.object({
  protocol: z.literal(PROTOCOL_VERSION),
  agentId: Id,
  roomId: Id,
  mode: OperatingMode,
  probes: z.array(Probe),
  actuators: z.array(Actuator),
  schedules: z.array(Schedule),
  /** IANA zone for schedule times. */
  timezone: z.string(),
  issuedAt: z.number().int(),
});
export type AgentConfig = z.infer<typeof AgentConfig>;

export const AgentCommand = z.discriminatedUnion('kind', [
  z.object({ id: z.string(), kind: z.literal('read'), probeId: Id }),
  /** Bounded run. The agent clamps durationMs to the actuator's maxRunMs. */
  z.object({
    id: z.string(),
    kind: z.literal('run'),
    actuatorId: Id,
    durationMs: z.number().int().positive(),
    source: ActuationSource,
  }),
  z.object({ id: z.string(), kind: z.literal('switch'), actuatorId: Id, on: z.boolean(), source: ActuationSource }),
  z.object({ id: z.string(), kind: z.literal('stop_all'), source: ActuationSource }),
  /** Runs a whole feed. Acked when it starts (or is refused); progress follows as `feed` events. */
  z.object({ id: z.string(), kind: z.literal('feed'), plan: FeedPlan }),
]);
export type AgentCommand = z.infer<typeof AgentCommand>;

export const CommandAck = z.object({
  id: z.string(),
  ok: z.boolean(),
  error: z.string().nullable(),
  /** For a read: the value (and `at` is the reading's time). For a run: the clamped duration. */
  value: z.number().nullable(),
  at: z.number().int(),
});
export type CommandAck = z.infer<typeof CommandAck>;

/** Stable, dependency-free hash of a config (issuedAt excluded) so hub and agent can compare versions. FNV-1a, 64-bit. */
export function configHash(config: AgentConfig): string {
  const { issuedAt: _issuedAt, ...rest } = config;
  const text = JSON.stringify(rest);
  let h = 0xcbf29ce484222325n;
  for (let i = 0; i < text.length; i++) {
    h ^= BigInt(text.charCodeAt(i));
    h = (h * 0x100000001b3n) & 0xffffffffffffffffn;
  }
  return h.toString(16).padStart(16, '0');
}
