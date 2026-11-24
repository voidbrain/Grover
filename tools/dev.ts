/**
 * Local development: hub + one agent with simulated hardware, in one process.
 *   npm run dev            then  npm run client  (Angular dev server, proxies /api to the hub)
 * State lives in data/dev/. Delete it to start over.
 */
import { Agent } from '../apps/agent/src/agent.ts';
import { MockDrivers } from '../apps/agent/src/drivers/mock.ts';
import { loadConfig } from '../apps/hub/src/config.ts';
import { startHub } from '../apps/hub/src/hub.ts';
import { seedDemo } from '../apps/hub/src/seed.ts';

// The Angular dev server (npm run client) proxies to the hub from another origin.
const hub = await startHub(
  loadConfig({ dbPath: 'data/dev/hub.sqlite', allowedOrigins: ['http://localhost:4200', 'http://127.0.0.1:4200'] }),
);
if (hub.store.listRooms().length === 0) seedDemo(hub.store, 'pi-1');
const token = hub.store.issueAgentToken('pi-1');

const agent = new Agent(
  { agentId: 'pi-1', token, hubUrl: `mqtt://127.0.0.1:${hub.mqttPort}`, stateDir: 'data/dev/agent', drivers: 'mock', version: 'dev' },
  new MockDrivers(),
);
await agent.start();

console.log(`hub  http://127.0.0.1:${hub.httpPort}  (MCP at /mcp)`);
console.log(`mqtt mqtt://127.0.0.1:${hub.mqttPort}  agent pi-1 with mock drivers`);

process.on('SIGINT', () => void agent.stop().then(() => hub.close()).then(() => process.exit(0)));
