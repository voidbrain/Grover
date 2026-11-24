import { readFileSync } from 'node:fs';
import { loadConfig } from './config.ts';
import { openDb } from './db.ts';
import { startHub } from './hub.ts';
import { importLegacy } from './legacy.ts';
import { Store } from './store.ts';

// One-off: `npm run hub -- import-legacy <dump.sql>` adds the old Grover's breeders, strains and plants.
if (process.argv[2] === 'import-legacy') {
  const file = process.argv[3];
  if (!file) throw new Error('usage: npm run hub -- import-legacy <dump.sql>');
  const config = loadConfig();
  const store = new Store(openDb(config.dbPath));
  const r = importLegacy(store, readFileSync(file, 'utf8'));
  console.log(`imported into ${config.dbPath}: ${r.breeders} breeders, ${r.strains} strains, ${r.plants} plants`);
  for (const line of r.skipped) console.log(`  note: ${line}`);
  console.log('If the hub is running, reload the client to see them.');
  store.db.close();
  process.exit(0);
}

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
