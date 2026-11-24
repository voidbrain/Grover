import { loadConfig } from './config.ts';
import { startHub } from './hub.ts';

const hub = await startHub(loadConfig());
console.log(
  `grover hub: http://${hub.config.httpHost}:${hub.httpPort}  mqtt://${hub.config.mqttHost}:${hub.mqttPort}  db ${hub.config.dbPath}`,
);

let closing = false;
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    if (closing) return;
    closing = true;
    void hub.close().then(() => process.exit(0));
  });
}
