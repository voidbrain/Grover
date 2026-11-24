import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

/**
 * Migrations run in order, once. Append only: never edit a shipped migration.
 * Structured fields (bindings, rules, phases) are JSON validated by @grover/contracts on read and write.
 */
export const MIGRATIONS: readonly string[] = [
  `
  CREATE TABLE calendars (id TEXT PRIMARY KEY, name TEXT NOT NULL, phases TEXT NOT NULL);
  CREATE TABLE rooms (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, agent_id TEXT UNIQUE, mode TEXT NOT NULL DEFAULT 'normal',
    auto_dose INTEGER NOT NULL DEFAULT 0, reservoir_liters REAL NOT NULL DEFAULT 20,
    calendar_id TEXT REFERENCES calendars(id), calendar_start TEXT
  );
  CREATE TABLE pots (id TEXT PRIMARY KEY, room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE, name TEXT NOT NULL);
  CREATE TABLE agents (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL, created_at INTEGER NOT NULL, last_seen INTEGER, last_status TEXT);
  CREATE TABLE probes (
    id TEXT PRIMARY KEY, room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE, pot_id TEXT REFERENCES pots(id) ON DELETE SET NULL,
    kind TEXT NOT NULL, name TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1, binding TEXT NOT NULL
  );
  CREATE TABLE actuators (
    id TEXT PRIMARY KEY, room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE, pot_id TEXT REFERENCES pots(id) ON DELETE SET NULL,
    kind TEXT NOT NULL, name TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1, binding TEXT NOT NULL,
    max_run_ms INTEGER NOT NULL, ml_per_second REAL
  );
  CREATE TABLE schedules (id TEXT PRIMARY KEY, target TEXT NOT NULL, rule TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1);
  CREATE TABLE readings (probe_id TEXT NOT NULL, at INTEGER NOT NULL, value REAL NOT NULL, PRIMARY KEY (probe_id, at)) WITHOUT ROWID;
  CREATE TABLE actuations (
    id INTEGER PRIMARY KEY, actuator_id TEXT NOT NULL, state TEXT NOT NULL, at INTEGER NOT NULL,
    ran_ms INTEGER, source TEXT NOT NULL, command_id TEXT
  );
  CREATE UNIQUE INDEX actuations_once ON actuations(actuator_id, at, state);
  CREATE TABLE faults (id INTEGER PRIMARY KEY, agent_id TEXT NOT NULL, at INTEGER NOT NULL, subject TEXT NOT NULL, message TEXT NOT NULL);
  CREATE UNIQUE INDEX faults_once ON faults(agent_id, at, subject);
  CREATE TABLE doses (
    id INTEGER PRIMARY KEY, room_id TEXT NOT NULL, at INTEGER NOT NULL, kind TEXT NOT NULL,
    ml REAL NOT NULL, liters REAL NOT NULL, before REAL, after REAL, source TEXT NOT NULL
  );
  CREATE INDEX doses_by_room ON doses(room_id, kind, at);
  `,
  // 2: feed cycle (F-011). Doses go into a mixing tank and reach a pot through a feed; the room reservoir and
  // its dose log are gone. Tanks are level probes with a role; alerts are kept while their condition lasts.
  `
  ALTER TABLE rooms RENAME COLUMN auto_dose TO auto_feed;
  -- Auto-feed is new behaviour: it starts off, whatever auto-dose was.
  UPDATE rooms SET auto_feed = 0;
  ALTER TABLE rooms DROP COLUMN reservoir_liters;
  ALTER TABLE rooms ADD COLUMN mix_empty_level REAL NOT NULL DEFAULT 1;
  ALTER TABLE rooms ADD COLUMN mix_settle_seconds INTEGER NOT NULL DEFAULT 60;
  ALTER TABLE rooms ADD COLUMN feed_cooldown_minutes INTEGER NOT NULL DEFAULT 60;
  ALTER TABLE rooms ADD COLUMN water_ec REAL NOT NULL DEFAULT 0.3;
  ALTER TABLE rooms ADD COLUMN water_ph REAL NOT NULL DEFAULT 7;
  ALTER TABLE pots ADD COLUMN liters REAL NOT NULL DEFAULT 10;
  ALTER TABLE pots ADD COLUMN feed_liters REAL NOT NULL DEFAULT 2;
  ALTER TABLE pots ADD COLUMN liters_per_cm REAL;
  ALTER TABLE probes ADD COLUMN tank TEXT;
  ALTER TABLE probes ADD COLUMN alert_below REAL;
  ALTER TABLE probes ADD COLUMN alert_above REAL;
  DROP TABLE doses;
  CREATE TABLE feeds (
    id TEXT PRIMARY KEY, room_id TEXT NOT NULL, pot_id TEXT NOT NULL, source TEXT NOT NULL, state TEXT NOT NULL,
    message TEXT NOT NULL, requested_at INTEGER NOT NULL, finished_at INTEGER, batch_liters REAL, ml TEXT,
    ec_before REAL, ph_before REAL, ec_after REAL, ph_after REAL,
    pot_liters_before REAL, expected_ec REAL, expected_ph REAL
  );
  CREATE INDEX feeds_by_pot ON feeds(pot_id, requested_at);
  CREATE TABLE alerts (
    key TEXT PRIMARY KEY, room_id TEXT NOT NULL, pot_id TEXT, level TEXT NOT NULL, message TEXT NOT NULL, since INTEGER NOT NULL
  );
  `,
  // 3: every pump needs a run cap (B-003). Pumps saved with none get 30 s, so the hub can read them again.
  `
  UPDATE actuators SET max_run_ms = 30000 WHERE max_run_ms <= 0 AND kind NOT IN ('light', 'fan', 'water_loop');
  `,
  // 4: what grows (F-012): breeders, strains with their parents, plants with their origin.
  `
  CREATE TABLE breeders (id TEXT PRIMARY KEY, name TEXT NOT NULL, website TEXT, notes TEXT NOT NULL DEFAULT '');
  CREATE TABLE strains (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, breeder_id TEXT REFERENCES breeders(id), parent_ids TEXT NOT NULL DEFAULT '[]',
    sativa_percent REAL, thc_percent REAL, cbd_percent REAL, flowering_days INTEGER, autoflower INTEGER NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE plants (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, strain_id TEXT REFERENCES strains(id), breeder_id TEXT REFERENCES breeders(id),
    generation INTEGER NOT NULL DEFAULT 0, mother_id TEXT REFERENCES plants(id) ON DELETE SET NULL,
    pot_id TEXT REFERENCES pots(id) ON DELETE SET NULL, medium TEXT,
    started_on TEXT, trimmed_on TEXT, bloom_on TEXT, flush_on TEXT, harvested_on TEXT, yield_grams REAL, notes TEXT NOT NULL DEFAULT ''
  );
  CREATE INDEX plants_by_pot ON plants(pot_id);
  `,
  // 5: lights follow the grow calendar (F-007).
  `
  ALTER TABLE rooms ADD COLUMN light_from TEXT NOT NULL DEFAULT 'schedule';
  ALTER TABLE rooms ADD COLUMN light_start TEXT NOT NULL DEFAULT '06:00';
  ALTER TABLE rooms ADD COLUMN light_plant_id TEXT REFERENCES plants(id) ON DELETE SET NULL;
  UPDATE rooms SET calendar_start = substr(calendar_start, 1, 10) WHERE calendar_start IS NOT NULL;
  UPDATE rooms SET calendar_start = NULL
    WHERE calendar_start IS NOT NULL AND calendar_start NOT GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]';
  `,
  // 6: probe calibration (F-004), JSON validated by the contracts schema.
  `
  ALTER TABLE probes ADD COLUMN calibration TEXT;
  `,
  // 7: the day a plant went into its pot (F-014), for its page and statistics.
  `
  ALTER TABLE plants ADD COLUMN placed_on TEXT;
  `,
];

export function openDb(path: string): DatabaseSync {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  migrate(db);
  return db;
}

function migrate(db: DatabaseSync): void {
  db.exec('CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL)');
  const row = db.prepare('SELECT version FROM schema_version').get() as { version: number } | undefined;
  let version = row?.version ?? 0;
  if (!row) db.prepare('INSERT INTO schema_version (version) VALUES (0)').run();
  for (; version < MIGRATIONS.length; version++) {
    db.exec('BEGIN');
    try {
      db.exec(MIGRATIONS[version]!);
      db.prepare('UPDATE schema_version SET version = ?').run(version + 1);
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }
}
