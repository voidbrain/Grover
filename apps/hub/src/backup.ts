import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

/**
 * Writes a consistent copy of the hub database to `file` with SQLite `VACUUM INTO`, safe while the hub runs.
 * Refuses a file that already exists and a database path with no database.
 */
export function backupDb(dbPath: string, file: string): string {
  const target = resolve(file);
  if (existsSync(target)) throw new Error(`${target} already exists: choose a new file`);
  if (!existsSync(dbPath)) throw new Error(`no database at ${dbPath} (GROVER_DB)`);
  mkdirSync(dirname(target), { recursive: true });
  const db = new DatabaseSync(dbPath, { readOnly: true });
  try {
    db.exec('PRAGMA busy_timeout = 5000;');
    db.prepare('VACUUM INTO ?').run(target);
  } finally {
    db.close();
  }
  return target;
}
