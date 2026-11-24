import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { AgentEvent } from '@grover/contracts';

type Body = AgentEvent extends infer E ? (E extends AgentEvent ? Omit<E, 'seq'> : never) : never;

/**
 * Durable queue of events for the hub. Survives reboots and hub outages; the sequence number
 * is the row id, so it keeps increasing across restarts. Capped so a long outage cannot fill the SD card.
 */
export class Outbox {
  private readonly db: DatabaseSync;
  private readonly cap: number;
  constructor(path: string, cap = 200_000) {
    this.cap = cap;
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(
      'PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS outbox (seq INTEGER PRIMARY KEY AUTOINCREMENT, payload TEXT NOT NULL)',
    );
  }

  push(body: Body): AgentEvent {
    const res = this.db.prepare('INSERT INTO outbox (payload) VALUES (?)').run(JSON.stringify(body));
    const seq = Number(res.lastInsertRowid);
    if (seq % 1000 === 0) this.db.prepare('DELETE FROM outbox WHERE seq <= ?').run(seq - this.cap);
    return { ...body, seq } as AgentEvent;
  }

  peek(limit = 200): AgentEvent[] {
    return (
      this.db.prepare('SELECT seq, payload FROM outbox ORDER BY seq LIMIT ?').all(limit) as {
        seq: number;
        payload: string;
      }[]
    ).map((r) => ({ ...JSON.parse(r.payload), seq: Number(r.seq) }) as AgentEvent);
  }

  ack(seq: number): void {
    this.db.prepare('DELETE FROM outbox WHERE seq = ?').run(seq);
  }

  size(): number {
    return Number((this.db.prepare('SELECT COUNT(*) AS n FROM outbox').get() as { n: number }).n);
  }

  close(): void {
    this.db.close();
  }
}
