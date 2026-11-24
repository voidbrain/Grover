import type { FastifyInstance } from 'fastify';
import { DEFAULT_CALENDAR } from '@grover/contracts';
import { AgentLink } from './agents.ts';
import { Commands } from './commands.ts';
import type { HubConfig } from './config.ts';
import { openDb } from './db.ts';
import { Bus } from './events.ts';
import { Alerts } from './alerts.ts';
import { Feeder } from './feeder.ts';
import { Lights } from './lights.ts';
import { PlantCycle } from './plant-cycle.ts';
import { PlantReports } from './plant-report.ts';
import { createHttp } from './http.ts';
import { Store } from './store.ts';

export interface Hub {
  config: HubConfig;
  store: Store;
  bus: Bus;
  agents: AgentLink;
  commands: Commands;
  alerts: Alerts;
  feeder: Feeder;
  plants: PlantCycle;
  lights: Lights;
  reports: PlantReports;
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
  const alerts = new Alerts(store, bus);
  const feeder = new Feeder(store, bus, agents, alerts, {
    mixMs: 10 * 60_000,
    freshMs: 60 * 60_000,
    timezone: config.timezone,
  });
  const plants = new PlantCycle(store, config.timezone);
  const lights = new Lights(store, feeder);
  agents.setConfigAdjuster((c) => lights.apply(c));
  const reports = new PlantReports(store, config.timezone);
  const hub: Hub = { config, store, bus, agents, commands, alerts, feeder, plants, lights, reports };

  const mqttPort = await agents.listen(config.mqttHost, config.mqttPort);
  const http = await createHttp(hub);
  await http.listen({ host: config.httpHost, port: config.httpPort });
  const address = http.server.address();
  const httpPort = typeof address === 'object' && address ? address.port : config.httpPort;
  // Phases move with the days: re-send configs now and then, so a light following the calendar changes on its
  // own. Agents ignore a config whose content is unchanged.
  const refresh = setInterval(() => agents.publishAllConfigs(), 10 * 60_000);
  refresh.unref();

  return {
    ...hub,
    http,
    httpPort,
    mqttPort,
    async close() {
      clearInterval(refresh);
      feeder.stop();
      alerts.stop();
      await http.close();
      await agents.close();
      store.db.close();
    },
  };
}
