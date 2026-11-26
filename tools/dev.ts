/**
 * Local development: hub + one agent with simulated hardware, in one process.
 *   npm run dev            then  npm run client  (Angular dev server, proxies /api to the hub)
 * State lives in data/dev/ (GROVER_DEV_DIR: another folder, as `npm run e2e` uses). Delete it to start over.
 * GROVER_HTTP_PORT and GROVER_MQTT_PORT choose the ports (0: any free one).
 */
import { Agent } from '../apps/agent/src/agent.ts';
import { join } from 'node:path';
import { MockDrivers } from '../apps/agent/src/drivers/mock.ts';
import { loadConfig } from '../apps/hub/src/config.ts';
import { startHub } from '../apps/hub/src/hub.ts';
import { seedDemo } from '../apps/hub/src/seed.ts';

const dir = process.env['GROVER_DEV_DIR'] || 'data/dev';

// The Angular dev server (npm run client) proxies to the hub from another origin.
const hub = await startHub(
  loadConfig({ dbPath: join(dir, 'hub.sqlite'), allowedOrigins: ['http://localhost:4200', 'http://127.0.0.1:4200'] }),
);
if (hub.store.listRooms().length === 0) seedDemo(hub.store, 'pi-1');
else if (hub.store.listPlants().length === 0 && hub.store.tankProbes('grow-1').mix === undefined)
  // The demo is only seeded into an empty database: one made by an older version lacks what came since.
  console.log(`note: ${dir} holds an older demo (no plants, no tanks). For the current one: stop, rm -rf ${dir}, start again.`);
const token = hub.store.issueAgentToken('pi-1');

const agent = new Agent(
  { agentId: 'pi-1', token, hubUrl: `mqtt://127.0.0.1:${hub.mqttPort}`, stateDir: join(dir, 'agent'), drivers: 'mock', version: 'dev' },
  new MockDrivers(),
);
await agent.start();

console.log(`hub  http://127.0.0.1:${hub.httpPort}  (MCP at /mcp)`);
console.log(`mqtt mqtt://127.0.0.1:${hub.mqttPort}  agent pi-1 with mock drivers`);

process.on('SIGINT', () => void agent.stop().then(() => hub.close()).then(() => process.exit(0)));
