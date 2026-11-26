import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { promisify } from 'node:util';
import { backupDb } from '../src/backup.ts';
import { openDb } from '../src/db.ts';
import { loadConfig } from '../src/config.ts';
import { startHub } from '../src/hub.ts';
import { seedDemo } from '../src/seed.ts';
import { Store } from '../src/store.ts';

const run = promisify(execFile);
const dir = () => mkdtempSync(join(tmpdir(), 'grover-backup-'));

test('a backup of a running hub restores with its rooms and readings', async () => {
  const folder = dir();
  const dbPath = join(folder, 'hub.sqlite');
  const hub = await startHub(
    loadConfig({ dbPath, httpPort: 0, mqttPort: 0, clientDir: '/nonexistent', timezone: 'UTC' }),
  );
  try {
    seedDemo(hub.store, 'pi-1');
    const at = Date.now();
    hub.store.addReading({ probeId: 'ph-1', at, value: 6.1 });

    const copy = join(folder, 'copies', 'hub-backup.sqlite');
    backupDb(dbPath, copy);

    const restored = new Store(openDb(copy));
    try {
      assert.deepEqual(
        restored.listRooms().map((r) => r.id),
        hub.store.listRooms().map((r) => r.id),
      );
      assert.deepEqual(restored.readings('ph-1', at), [{ probeId: 'ph-1', at, value: 6.1 }]);
    } finally {
      restored.db.close();
    }
  } finally {
    await hub.close();
  }
});

test('a backup refuses a file that exists and a database that does not', () => {
  const folder = dir();
  const dbPath = join(folder, 'hub.sqlite');
  new Store(openDb(dbPath)).db.close();
  const existing = join(folder, 'old.sqlite');
  writeFileSync(existing, 'keep me');
  assert.throws(() => backupDb(dbPath, existing), /already exists/);
  assert.throws(() => backupDb(join(folder, 'missing.sqlite'), join(folder, 'new.sqlite')), /no database/);
});

test('`npm run hub -- backup <file>` writes the copy of GROVER_DB', async () => {
  const folder = dir();
  const dbPath = join(folder, 'hub.sqlite');
  const store = new Store(openDb(dbPath));
  store.addReading({ probeId: 'ec-1', at: 1_000, value: 1.4 });
  store.db.close();
  const copy = join(folder, 'backup.sqlite');

  const { stdout } = await run(process.execPath, ['apps/hub/src/main.ts', 'backup', copy], {
    env: { ...process.env, GROVER_DB: dbPath },
  });
  assert.match(stdout, /backup\.sqlite/);
  const restored = new Store(openDb(copy));
  assert.deepEqual(restored.readings('ec-1', 0), [{ probeId: 'ec-1', at: 1_000, value: 1.4 }]);
  restored.db.close();

  await assert.rejects(
    run(process.execPath, ['apps/hub/src/main.ts', 'backup', copy], { env: { ...process.env, GROVER_DB: dbPath } }),
    /already exists/,
  );
});
