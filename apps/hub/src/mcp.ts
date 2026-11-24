import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { OperatingMode, PROBE_KINDS, ancestry, generationLabel, geneticsLabel, lineage } from '@grover/contracts';
import type { Hub } from './hub.ts';

const text = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] });

/**
 * MCP tools for NERV (or any MCP client). Read tools are free; tools that move hardware go through
 * the same Commands checks as the UI. NERV's own gate decides whether to ask its owner first:
 * every tool that changes state says so in its description and is annotated as not read-only.
 */
export function createMcpServer(hub: Hub): McpServer {
  const { store, commands, feeder, alerts, agents, plants, lights } = hub;
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
            light: lights.plan(room),
            pots: store.listPots(room.id).map((pot) => ({
              ...pot,
              phase: feeder.potPhase(pot),
              plants: store.listPlants().filter((p) => p.potId === pot.id && p.harvestedOn === null),
            })),
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
    'grover_plants',
    {
      description:
        'Plants with their strain (breeder, sativa/indica, THC/CBD, flowering days, ancestry), generation (0 from seed, 1 first cutting…), line of mothers, pot and dates. Optionally only plants in a pot, or still growing.',
      inputSchema: { potId: z.string().optional(), growingOnly: z.boolean().optional() },
      annotations: { readOnlyHint: true },
    },
    async ({ potId, growingOnly }) => {
      const strains = store.listStrains();
      const breeders = new Map(store.listBreeders().map((b) => [b.id, b]));
      const plants = store.listPlants();
      return text(
        plants
          .filter((p) => (potId ? p.potId === potId : true) && (growingOnly ? p.harvestedOn === null : true))
          .map((p) => {
            const strain = strains.find((s) => s.id === p.strainId) ?? null;
            return {
              plant: p,
              origin: generationLabel(p.generation),
              breeder: p.breederId ? (breeders.get(p.breederId)?.name ?? p.breederId) : null,
              strain: strain && {
                ...strain,
                genetics: geneticsLabel(strain.sativaPercent),
                breeder: strain.breederId ? (breeders.get(strain.breederId)?.name ?? strain.breederId) : null,
                ancestry: ancestry(strain.id, strains),
              },
              mothers: lineage(p.id, plants).map((m) => ({ id: m.id, name: m.name, generation: m.generation })),
            };
          }),
      );
    },
  );

  server.registerTool(
    'grover_take_cuttings',
    {
      description:
        'Records cuttings taken from a plant: N new plants of the next generation, that plant as mother, growing elsewhere (no pot), started today. Warns past generation 5. Changes records only, no hardware.',
      inputSchema: { plantId: z.string(), count: z.number().int().min(1).max(20) },
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async ({ plantId, count }) => {
      const r = plants.takeCuttings(plantId, count);
      agents.publishAllConfigs();
      return text(r);
    },
  );

  server.registerTool(
    'grover_harvest',
    {
      description:
        "Records a plant's harvest (today unless a YYYY-MM-DD date is given, optional yield in grams) and frees its pot. Records only.",
      inputSchema: { plantId: z.string(), date: z.string().optional(), yieldGrams: z.number().min(0).optional() },
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async ({ plantId, date, yieldGrams }) => {
      const r = plants.harvest(plantId, date, yieldGrams);
      agents.publishAllConfigs();
      return text(r);
    },
  );

  server.registerTool(
    'grover_switch_to_bloom',
    {
      description:
        'Records that a plant switched to flowering today: its phase (and feed) moves to bloom, and the tent light too when it follows this plant (calendar-driven light). Records only.',
      inputSchema: { plantId: z.string() },
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async ({ plantId }) => {
      const p = plants.markBloom(plantId);
      agents.publishAllConfigs();
      return text(p);
    },
  );

  server.registerTool(
    'grover_start_flush',
    {
      description: 'Records that a plant started its flush today (plain water from now on). Records only.',
      inputSchema: { plantId: z.string() },
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async ({ plantId }) => {
      const p = plants.markFlush(plantId);
      agents.publishAllConfigs();
      return text(p);
    },
  );

  server.registerTool(
    'grover_place_plant',
    {
      description:
        'Records that a plant growing elsewhere was placed in a free pot of the tent. Refused if the pot holds a growing plant. Records only.',
      inputSchema: { potId: z.string(), plantId: z.string() },
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async ({ potId, plantId }) => {
      const r = plants.place(potId, plantId);
      agents.publishAllConfigs();
      return text(r);
    },
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
