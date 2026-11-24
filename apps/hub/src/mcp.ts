import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { OperatingMode, PROBE_KINDS } from '@grover/contracts';
import type { Hub } from './hub.ts';

const text = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] });

/**
 * MCP tools for NERV (or any MCP client). Read tools are free; tools that move hardware go through
 * the same Commands checks as the UI. NERV's own gate decides whether to ask its owner first:
 * every tool that changes state says so in its description and is annotated as not read-only.
 */
export function createMcpServer(hub: Hub): McpServer {
  const { store, commands, feeder, alerts, agents } = hub;
  const server = new McpServer({ name: 'grover', version: '2.0.0' });

  server.registerTool(
    'grover_overview',
    {
      description: 'Rooms, their mode, agent status, grow phase and the latest reading of every probe. Start here.',
      annotations: { readOnlyHint: true },
    },
    async () =>
      text(
        store.listRooms().map((room) => {
          const latest = new Map(store.latestReadings().map((r) => [r.probeId, r]));
          return {
            room,
            agent: room.agentId ? agents.view(room.agentId) : null,
            phase: feeder.phase(room),
            pots: store.listPots(room.id),
            alerts: alerts.list().filter((a) => a.roomId === room.id),
            probes: store.listProbes(room.id).map((p) => ({
              id: p.id,
              kind: p.kind,
              unit: PROBE_KINDS[p.kind].unit,
              name: p.name,
              latest: latest.get(p.id) ?? null,
            })),
            actuators: store.listActuators(room.id).map((a) => ({
              id: a.id,
              kind: a.kind,
              name: a.name,
              enabled: a.enabled,
              maxRunMs: a.maxRunMs,
              calibrated: a.mlPerSecond !== null,
            })),
          };
        }),
      ),
  );

  server.registerTool(
    'grover_readings',
    {
      description: 'Readings of one probe over the last N hours (default 24).',
      inputSchema: {
        probeId: z.string(),
        hours: z
          .number()
          .positive()
          .max(24 * 90)
          .optional(),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ probeId, hours }) => text(store.readings(probeId, Date.now() - (hours ?? 24) * 3_600_000)),
  );

  server.registerTool(
    'grover_history',
    {
      description: 'Actuations and agent faults over the last N hours (default 24).',
      inputSchema: {
        hours: z
          .number()
          .positive()
          .max(24 * 30)
          .optional(),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ hours }) => {
      const since = Date.now() - (hours ?? 24) * 3_600_000;
      return text({ actuations: store.actuations(since), faults: store.faults(since) });
    },
  );

  server.registerTool(
    'grover_alerts',
    {
      description:
        'What needs the owner now: low supply tanks, refused or stopped feeds, offline agents. Each stays until its condition clears.',
      annotations: { readOnlyHint: true },
    },
    async () => text(alerts.list()),
  );

  server.registerTool(
    'grover_feed_preview',
    {
      description:
        'What a feed of this pot would mix now (batch, mL per pump, reasons), or why it would be refused. Does not run anything.',
      inputSchema: { potId: z.string() },
      annotations: { readOnlyHint: true },
    },
    async ({ potId }) => text(feeder.preview(potId)),
  );

  server.registerTool(
    'grover_feeds',
    {
      description: 'Feeds of the last N days (default 7), newest first, with doses and EC/pH before and after.',
      inputSchema: { days: z.number().positive().max(90).optional(), potId: z.string().optional() },
      annotations: { readOnlyHint: true },
    },
    async ({ days, potId }) => text(store.feeds(Date.now() - (days ?? 7) * 86_400_000, potId)),
  );

  server.registerTool(
    'grover_read_probe',
    {
      description: 'Takes a fresh reading from a probe now.',
      inputSchema: { probeId: z.string() },
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async ({ probeId }) => text(await commands.readProbe(probeId)),
  );

  server.registerTool(
    'grover_run_pump',
    {
      description:
        'CHANGES HARDWARE STATE. Runs a pump for a bounded time (durationMs) or volume (ml, calibrated pumps only). Refused outside normal mode or above the pump cap.',
      inputSchema: {
        actuatorId: z.string(),
        durationMs: z.number().int().positive().optional(),
        ml: z.number().positive().optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: true },
    },
    async ({ actuatorId, durationMs, ml }) =>
      text(await commands.run(actuatorId, durationMs !== undefined ? { durationMs } : { ml: ml ?? 0 }, 'mcp')),
  );

  server.registerTool(
    'grover_switch',
    {
      description: 'CHANGES HARDWARE STATE. Turns a light, fan or water loop on or off.',
      inputSchema: { actuatorId: z.string(), on: z.boolean() },
      annotations: { readOnlyHint: false, destructiveHint: true },
    },
    async ({ actuatorId, on }) => text(await commands.switch(actuatorId, on, 'mcp')),
  );

  server.registerTool(
    'grover_feed_pot',
    {
      description:
        'CHANGES HARDWARE STATE. Feeds one pot now: mixes its batch in the mixing tank and pumps it into the pot. Refused (with the reason) when a supply tank is low, the mixing tank is not empty, the pot is full or another feed is running.',
      inputSchema: { potId: z.string() },
      annotations: { readOnlyHint: false, destructiveHint: true },
    },
    async ({ potId }) => text(await feeder.feed(potId, 'mcp')),
  );

  server.registerTool(
    'grover_set_mode',
    {
      description:
        'CHANGES HARDWARE STATE. Sets a room mode: normal (all runs), silent (probes and lights only), off (everything off).',
      inputSchema: { roomId: z.string(), mode: OperatingMode },
      annotations: { readOnlyHint: false, destructiveHint: true },
    },
    async ({ roomId, mode }) => {
      commands.setMode(roomId, mode);
      return text({ roomId, mode });
    },
  );

  server.registerTool(
    'grover_stop_all',
    {
      description:
        'CHANGES HARDWARE STATE. Emergency stop: turns every actuator in the room off now. Safe to call any time.',
      inputSchema: { roomId: z.string() },
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async ({ roomId }) => text(await commands.stopAll(roomId, 'mcp')),
  );

  return server;
}
