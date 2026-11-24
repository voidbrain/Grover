import { Agent } from './agent.ts';
import { loadEnv } from './config.ts';
import { HardwareDrivers } from './drivers/hardware.ts';
import { MockDrivers } from './drivers/mock.ts';

const env = loadEnv();
const mock = new MockDrivers();
const agent = new Agent(env, env.drivers === 'hardware' ? new HardwareDrivers(mock) : mock);
await agent.start();
console.log(`grover agent ${env.agentId}: hub ${env.hubUrl}, ${env.drivers} drivers, state in ${env.stateDir}`);

let stopping = false;
const shutdown = (code: number) => {
  if (stopping) return;
  stopping = true;
  // Whatever happens, actuators go off before the process leaves.
  void agent.stop().finally(() => process.exit(code));
  setTimeout(() => process.exit(code), 5000).unref();
};
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('uncaughtException', (err) => {
  console.error(err);
  shutdown(1);
});
process.on('unhandledRejection', (err) => {
  console.error(err);
  shutdown(1);
});
