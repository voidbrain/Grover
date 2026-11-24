import { existsSync } from 'node:fs';
import Fastify, { type FastifyInstance, type FastifyReply } from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { ZodError } from 'zod';
import {
  CuttingsRequest,
  HarvestRequest,
  Id,
  ModeRequest,
  PROBE_KINDS,
  PlaceRequest,
  RunRequest,
  SwitchRequest,
} from '@grover/contracts';
import { AgentOffline, CommandTimeout } from './agents.ts';
import { Refused } from './commands.ts';
import type { Hub } from './hub.ts';
import { createMcpServer } from './mcp.ts';
import { BadReference, InUse, NotFound } from './store.ts';

type Entity = 'rooms' | 'pots' | 'probes' | 'actuators' | 'schedules' | 'calendars' | 'breeders' | 'strains' | 'plants';

/**
 * HTTP surface of the hub:
 *   /api/*      JSON API for the client and NERV
 *   /api/live   WebSocket of LiveEvents
 *   /mcp        MCP (streamable HTTP, stateless) for NERV
 *   /           the Angular client
 *
 * There is no login: the hub listens on loopback and is published to the tailnet with `tailscale serve`,
 * so only devices on your tailnet reach it.
 */
export async function createHttp(hub: Hub): Promise<FastifyInstance> {
  const { store, agents, commands, feeder, alerts, bus, config, plants, lights } = hub;
  const app = Fastify({ logger: false });
  await app.register(fastifyWebsocket);

  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof ZodError) return reply.code(400).send({ error: 'invalid', issues: err.issues });
    if (err instanceof NotFound) return reply.code(404).send({ error: err.message });
    if (err instanceof BadReference) return reply.code(400).send({ error: err.message });
    if (err instanceof Refused || err instanceof InUse) return reply.code(409).send({ error: err.message });
    if (err instanceof AgentOffline) return reply.code(503).send({ error: err.message });
    if (err instanceof CommandTimeout) return reply.code(504).send({ error: err.message });
    const sqlite =
      (err as { code?: string; errstr?: string; message?: string }).code === 'ERR_SQLITE_ERROR'
        ? (err as Error).message
        : '';
    if (/FOREIGN KEY constraint failed/i.test(sqlite))
      return reply.code(409).send({ error: 'still in use: remove what refers to it first' });
    if (/UNIQUE constraint failed: rooms\.agent_id/i.test(sqlite))
      return reply.code(409).send({ error: 'that agent already runs another room' });
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    if (status >= 500) console.error(err);
    return reply.code(status).send({ error: (err as Error).message });
  });

  // ── who may talk to the hub ──────────────────────────────────────────────
  // Loopback plus `tailscale serve` keeps strangers out, but not a web page open in a browser on the tailnet:
  // refuse unknown Host names (DNS rebinding), foreign Origins (cross-site requests and sockets), and POST/PUT
  // without a JSON body (a plain cross-site form cannot send one without a preflight).
  const hostAllowed = (host: string | undefined): boolean => {
    if (!host) return false;
    let url: URL;
    try {
      url = new URL(`http://${host.toLowerCase()}`);
    } catch {
      return false;
    }
    const address = app.server.address();
    const port = String(typeof address === 'object' && address ? address.port : config.httpPort);
    const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
    if (loopback) return url.port === port;
    return config.allowedHosts.some((a) => a === url.host || a === url.hostname);
  };
  app.addHook('onRequest', async (req, reply) => {
    if (!hostAllowed(req.headers.host))
      return reply.code(403).send({ error: `unknown host ${req.headers.host}: add it to GROVER_ALLOWED_HOSTS` });
    const origin = req.headers.origin;
    if (origin !== undefined) {
      const allowed = (): boolean => {
        try {
          const url = new URL(origin);
          return config.allowedOrigins.includes(url.origin.toLowerCase()) || hostAllowed(url.host);
        } catch {
          return false;
        }
      };
      if (!allowed()) return reply.code(403).send({ error: `requests from ${origin} are not allowed` });
    }
    if (
      (req.method === 'POST' || req.method === 'PUT') &&
      !/^application\/json\b/i.test(req.headers['content-type'] ?? '')
    )
      return reply.code(415).send({ error: 'send JSON (content-type: application/json)' });
  });

  // ── read ─────────────────────────────────────────────────────────────────
  app.get('/api/health', async () => ({
    ok: true,
    agents: agents.views().map((a) => ({ id: a.agentId, online: a.online })),
  }));
  app.get('/api/snapshot', async () => ({
    rooms: store.listRooms().map((room) => {
      const light = lights.plan(room);
      // Set to follow the calendar but nothing to follow: its own schedules run; say so.
      return {
        ...room,
        phase: feeder.phase(room),
        light,
        lightFallback: room.lightFrom === 'calendar' && light === null,
      };
    }),
    pots: store.listPots(),
    potPhases: Object.fromEntries(store.listPots().map((p) => [p.id, feeder.potPhase(p)])),
    probes: store.listProbes(),
    actuators: store.listActuators(),
    schedules: store.listSchedules(),
    calendars: store.listCalendars(),
    breeders: store.listBreeders(),
    strains: store.listStrains(),
    plants: store.listPlants(),
    agents: agents.views(),
    latest: store.latestReadings(),
    alerts: alerts.list(),
    feeds: store.feeds(Date.now() - 7 * 86_400_000),
    probeKinds: PROBE_KINDS,
  }));
  app.get<{ Params: { id: string }; Querystring: { since?: string; until?: string } }>(
    '/api/probes/:id/readings',
    async (req) => {
      store.getProbe(req.params.id);
      const since = Number(req.query.since ?? Date.now() - 86_400_000);
      const until = req.query.until ? Number(req.query.until) : undefined;
      return store.readings(req.params.id, since, until);
    },
  );
  app.get<{ Querystring: { since?: string; actuatorId?: string } }>('/api/actuations', async (req) =>
    store.actuations(Number(req.query.since ?? Date.now() - 86_400_000), req.query.actuatorId),
  );
  app.get<{ Querystring: { since?: string } }>('/api/faults', async (req) =>
    store.faults(Number(req.query.since ?? Date.now() - 7 * 86_400_000)),
  );
  app.get('/api/alerts', async () => alerts.list());
  app.get<{ Querystring: { since?: string; potId?: string } }>('/api/feeds', async (req) =>
    store.feeds(Number(req.query.since ?? Date.now() - 7 * 86_400_000), req.query.potId),
  );
  app.get<{ Params: { id: string } }>('/api/pots/:id/feed', async (req) => feeder.preview(req.params.id));

  // ── commands ─────────────────────────────────────────────────────────────
  app.post<{ Params: { id: string } }>('/api/probes/:id/read', async (req) => commands.readProbe(req.params.id));
  app.post<{ Params: { id: string } }>('/api/probes/:id/read-raw', async (req) => commands.readRaw(req.params.id));
  app.post<{ Params: { id: string } }>('/api/actuators/:id/run', async (req) =>
    commands.run(req.params.id, RunRequest.parse(req.body), 'manual'),
  );
  app.post<{ Params: { id: string } }>('/api/actuators/:id/switch', async (req) =>
    commands.switch(req.params.id, SwitchRequest.parse(req.body).on, 'manual'),
  );
  app.post<{ Params: { id: string } }>('/api/rooms/:id/stop', async (req) => commands.stopAll(req.params.id, 'manual'));
  // ── plant cycle (record changes, no hardware) ───────────────────────────
  // Plant changes can move a phase, and so the light: re-send configs after each.
  const thenPublish = <T>(value: T): T => {
    agents.publishAllConfigs();
    return value;
  };
  app.post<{ Params: { id: string } }>('/api/plants/:id/cuttings', async (req) =>
    thenPublish(plants.takeCuttings(req.params.id, CuttingsRequest.parse(req.body).count)),
  );
  app.post<{ Params: { id: string } }>('/api/plants/:id/bloom', async (req) =>
    thenPublish(plants.markBloom(req.params.id)),
  );
  app.post<{ Params: { id: string } }>('/api/plants/:id/flush', async (req) =>
    thenPublish(plants.markFlush(req.params.id)),
  );
  app.post<{ Params: { id: string } }>('/api/plants/:id/harvest', async (req) => {
    const body = HarvestRequest.parse(req.body);
    return thenPublish(plants.harvest(req.params.id, body.date, body.yieldGrams));
  });
  app.post<{ Params: { id: string } }>('/api/pots/:id/place', async (req) =>
    thenPublish(plants.place(req.params.id, PlaceRequest.parse(req.body).plantId)),
  );
  app.post<{ Params: { id: string } }>('/api/pots/:id/feed', async (req) => feeder.feed(req.params.id, 'manual'));
  app.put<{ Params: { id: string } }>('/api/rooms/:id/mode', async (req) => {
    commands.setMode(req.params.id, ModeRequest.parse(req.body).mode);
    return store.getRoom(req.params.id);
  });

  // ── setup (CRUD) ─────────────────────────────────────────────────────────
  const put = {
    rooms: (b: unknown) => store.putRoom(b),
    pots: (b: unknown) => store.putPot(b),
    probes: (b: unknown) => store.putProbe(b),
    actuators: (b: unknown) => store.putActuator(b),
    schedules: (b: unknown) => store.putSchedule(b),
    calendars: (b: unknown) => store.putCalendar(b),
    breeders: (b: unknown) => store.putBreeder(b),
    strains: (b: unknown) => store.putStrain(b),
    plants: (b: unknown) => store.putPlant(b),
  } satisfies Record<Entity, (b: unknown) => unknown>;
  for (const entity of Object.keys(put) as Entity[]) {
    app.put<{ Params: { id: string } }>(`/api/${entity}/:id`, async (req) => {
      const body = { ...(req.body as object), id: Id.parse(req.params.id) };
      const saved = store.tx(() => put[entity](body));
      agents.publishAllConfigs();
      return saved;
    });
    app.delete<{ Params: { id: string } }>(`/api/${entity}/:id`, async (req, reply: FastifyReply) => {
      if (!store.deleteEntity(entity, req.params.id)) throw new NotFound(`${entity} ${req.params.id}`);
      agents.publishAllConfigs();
      return reply.code(204).send();
    });
  }
  /** Registers an agent (or rotates its token). The token is shown once; a connected agent must reconnect with it. */
  app.post<{ Params: { id: string } }>('/api/agents/:id/token', async (req) => {
    const token = store.issueAgentToken(Id.parse(req.params.id));
    agents.disconnect(req.params.id);
    return { agentId: req.params.id, token };
  });
  app.delete<{ Params: { id: string } }>('/api/agents/:id', async (req, reply: FastifyReply) => {
    if (!store.deleteAgent(req.params.id)) throw new NotFound(`agent ${req.params.id}`);
    agents.disconnect(req.params.id);
    return reply.code(204).send();
  });

  // ── live ─────────────────────────────────────────────────────────────────
  app.get('/api/live', { websocket: true }, (socket) => {
    const off = bus.on((ev) => socket.send(JSON.stringify(ev)));
    socket.on('close', off);
  });

  // ── MCP ──────────────────────────────────────────────────────────────────
  app.all('/mcp', async (req, reply) => {
    const server = createMcpServer(hub);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    reply.raw.on('close', () => {
      void transport.close();
      void server.close();
    });
    await server.connect(transport);
    reply.hijack();
    await transport.handleRequest(req.raw, reply.raw, req.body);
  });

  // ── client ───────────────────────────────────────────────────────────────
  if (existsSync(config.clientDir)) {
    await app.register(fastifyStatic, { root: config.clientDir, wildcard: false });
    app.setNotFoundHandler((req, reply) =>
      req.url.startsWith('/api/') ? reply.code(404).send({ error: 'not found' }) : reply.sendFile('index.html'),
    );
  }

  return app;
}
