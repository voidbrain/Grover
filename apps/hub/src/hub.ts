import type { FastifyInstance } from 'fastify';
import { DEFAULT_CALENDAR } from '@grover/contracts';
import { AgentLink } from './agents.ts';
import { Commands } from './commands.ts';
import type { HubConfig } from './config.ts';
import { Control } from './control.ts';
import { openDb } from './db.ts';
import { Bus } from './events.ts';
import { createHttp } from './http.ts';
import { Store } from './store.ts';

export interface Hub {
  config: HubConfig;
  store: Store;
  bus: Bus;
  agents: AgentLink;
  commands: Commands;
  control: Control;
}

export interface RunningHub extends Hub {
  http: FastifyInstance;
  httpPort: number;
  mqttPort: number;
  close(): Promise<void>;
}

export async function startHub(config: HubConfig): Promise<RunningHub> {
  const store = new Store(openDb(config.dbPath));
  if (store.listCalendars().length === 0) store.putCalendar(DEFAULT_CALENDAR);
  const bus = new Bus();
  const agents = new AgentLink(store, bus, { timezone: config.timezone, commandTimeoutMs: config.commandTimeoutMs });
  const commands = new Commands(store, agents, bus);
  const control = new Control(store, bus, commands, {
    mixMs: 10 * 60_000,
    freshMs: 60 * 60_000,
    autoDoseCooldownMs: config.autoDoseCooldownMs,
  });
  const hub: Hub = { config, store, bus, agents, commands, control };

  const mqttPort = await agents.listen(config.mqttHost, config.mqttPort);
  const http = await createHttp(hub);
  await http.listen({ host: config.httpHost, port: config.httpPort });
  const address = http.server.address();
  const httpPort = typeof address === 'object' && address ? address.port : config.httpPort;

  return {
    ...hub,
    http,
    httpPort,
    mqttPort,
    async close() {
      control.stop();
      await http.close();
      await agents.close();
      store.db.close();
    },
  };
}
