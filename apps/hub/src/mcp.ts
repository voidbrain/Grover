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
  const { store, commands, control, agents } = hub;
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
            phase: control.phase(room),
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
    'grover_dose_suggestion',
    {
      description:
        'What the dosing model would add now to bring EC and pH into the phase range, with the reasoning and model coefficients. Does not run anything.',
      inputSchema: { roomId: z.string() },
      annotations: { readOnlyHint: true },
    },
    async ({ roomId }) => text(control.suggest(roomId)),
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
    'grover_apply_dose',
    {
      description: 'CHANGES HARDWARE STATE. Runs the current dose suggestion for a room (one correction step).',
      inputSchema: { roomId: z.string() },
      annotations: { readOnlyHint: false, destructiveHint: true },
    },
    async ({ roomId }) => text(await control.apply(roomId, 'mcp')),
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
