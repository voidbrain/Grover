import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { DatabaseSync, SQLInputValue } from 'node:sqlite';
import {
  Actuation,
  Actuator,
  AgentStatus,
  Calendar,
  Phase,
  Pot,
  Probe,
  Reading,
  Room,
  Schedule,
  type ProbeKind,
} from '@grover/contracts';
import { z } from 'zod';

type Row = Record<string, SQLInputValue>;
const bool = (v: unknown) => v === 1 || v === 1n;
const json = (v: unknown) => JSON.parse(String(v));
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export class NotFound extends Error {}

/** All persistence for the hub. Everything that enters is validated with the shared contracts. */
export class Store {
  readonly db: DatabaseSync;
  constructor(db: DatabaseSync) {
    this.db = db;
  }

  tx<T>(fn: () => T): T {
    this.db.exec('BEGIN');
    try {
      const out = fn();
      this.db.exec('COMMIT');
      return out;
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }

  // ── calendars ──────────────────────────────────────────────────────────────
  listCalendars(): Calendar[] {
    return (this.db.prepare('SELECT * FROM calendars ORDER BY name').all() as Row[]).map((r) => ({
      id: String(r['id']),
      name: String(r['name']),
      phases: z.array(Phase).parse(json(r['phases'])),
    }));
  }
  getCalendar(id: string): Calendar | null {
    return this.listCalendars().find((c) => c.id === id) ?? null;
  }
  putCalendar(input: unknown): Calendar {
    const c = Calendar.parse(input);
    this.db
      .prepare(
        'INSERT INTO calendars (id, name, phases) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name, phases = excluded.phases',
      )
      .run(c.id, c.name, JSON.stringify(c.phases));
    return c;
  }

  // ── rooms ──────────────────────────────────────────────────────────────────
  private room(r: Row): Room {
    return {
      id: String(r['id']),
      name: String(r['name']),
      agentId: r['agent_id'] == null ? null : String(r['agent_id']),
      mode: r['mode'] as Room['mode'],
      autoDose: bool(r['auto_dose']),
      reservoirLiters: Number(r['reservoir_liters']),
      calendarId: r['calendar_id'] == null ? null : String(r['calendar_id']),
      calendarStart: r['calendar_start'] == null ? null : String(r['calendar_start']),
    };
  }
  listRooms(): Room[] {
    return (this.db.prepare('SELECT * FROM rooms ORDER BY name').all() as Row[]).map((r) => this.room(r));
  }
  getRoom(id: string): Room {
    const r = this.db.prepare('SELECT * FROM rooms WHERE id = ?').get(id) as Row | undefined;
    if (!r) throw new NotFound(`room ${id}`);
    return this.room(r);
  }
  roomForAgent(agentId: string): Room | null {
    const r = this.db.prepare('SELECT * FROM rooms WHERE agent_id = ?').get(agentId) as Row | undefined;
    return r ? this.room(r) : null;
  }
  putRoom(input: unknown): Room {
    const r = Room.parse(input);
    this.db
      .prepare(
        `INSERT INTO rooms (id, name, agent_id, mode, auto_dose, reservoir_liters, calendar_id, calendar_start) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, agent_id = excluded.agent_id, mode = excluded.mode, auto_dose = excluded.auto_dose,
           reservoir_liters = excluded.reservoir_liters, calendar_id = excluded.calendar_id, calendar_start = excluded.calendar_start`,
      )
      .run(r.id, r.name, r.agentId, r.mode, r.autoDose ? 1 : 0, r.reservoirLiters, r.calendarId, r.calendarStart);
    return r;
  }

  // ── pots ───────────────────────────────────────────────────────────────────
  listPots(roomId?: string): Pot[] {
    const rows = (
      roomId
        ? this.db.prepare('SELECT * FROM pots WHERE room_id = ? ORDER BY name').all(roomId)
        : this.db.prepare('SELECT * FROM pots ORDER BY name').all()
    ) as Row[];
    return rows.map((r) => ({ id: String(r['id']), roomId: String(r['room_id']), name: String(r['name']) }));
  }
  putPot(input: unknown): Pot {
    const p = Pot.parse(input);
    this.db
      .prepare(
        'INSERT INTO pots (id, room_id, name) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET room_id = excluded.room_id, name = excluded.name',
      )
      .run(p.id, p.roomId, p.name);
    return p;
  }

  // ── probes ─────────────────────────────────────────────────────────────────
  private probe(r: Row): Probe {
    return Probe.parse({
      id: r['id'],
      roomId: r['room_id'],
      potId: r['pot_id'] ?? null,
      kind: r['kind'],
      name: r['name'],
      enabled: bool(r['enabled']),
      binding: json(r['binding']),
    });
  }
  listProbes(roomId?: string): Probe[] {
    const rows = (
      roomId
        ? this.db.prepare('SELECT * FROM probes WHERE room_id = ? ORDER BY name').all(roomId)
        : this.db.prepare('SELECT * FROM probes ORDER BY name').all()
    ) as Row[];
    return rows.map((r) => this.probe(r));
  }
  getProbe(id: string): Probe {
    const r = this.db.prepare('SELECT * FROM probes WHERE id = ?').get(id) as Row | undefined;
    if (!r) throw new NotFound(`probe ${id}`);
    return this.probe(r);
  }
  /** The probe that stands for the room's reservoir: room-level first, then any. */
  roomProbe(roomId: string, kind: ProbeKind): Probe | null {
    const all = this.listProbes(roomId).filter((p) => p.kind === kind && p.enabled);
    return all.find((p) => p.potId === null) ?? all[0] ?? null;
  }
  putProbe(input: unknown): Probe {
    const p = Probe.parse(input);
    this.db
      .prepare(
        `INSERT INTO probes (id, room_id, pot_id, kind, name, enabled, binding) VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET room_id = excluded.room_id, pot_id = excluded.pot_id, kind = excluded.kind, name = excluded.name,
           enabled = excluded.enabled, binding = excluded.binding`,
      )
      .run(p.id, p.roomId, p.potId, p.kind, p.name, p.enabled ? 1 : 0, JSON.stringify(p.binding));
    return p;
  }

  // ── actuators ──────────────────────────────────────────────────────────────
  private actuator(r: Row): Actuator {
    return Actuator.parse({
      id: r['id'],
      roomId: r['room_id'],
      potId: r['pot_id'] ?? null,
      kind: r['kind'],
      name: r['name'],
      enabled: bool(r['enabled']),
      binding: json(r['binding']),
      maxRunMs: Number(r['max_run_ms']),
      mlPerSecond: r['ml_per_second'] == null ? null : Number(r['ml_per_second']),
    });
  }
  listActuators(roomId?: string): Actuator[] {
    const rows = (
      roomId
        ? this.db.prepare('SELECT * FROM actuators WHERE room_id = ? ORDER BY name').all(roomId)
        : this.db.prepare('SELECT * FROM actuators ORDER BY name').all()
    ) as Row[];
    return rows.map((r) => this.actuator(r));
  }
  getActuator(id: string): Actuator {
    const r = this.db.prepare('SELECT * FROM actuators WHERE id = ?').get(id) as Row | undefined;
    if (!r) throw new NotFound(`actuator ${id}`);
    return this.actuator(r);
  }
  putActuator(input: unknown): Actuator {
    const a = Actuator.parse(input);
    this.db
      .prepare(
        `INSERT INTO actuators (id, room_id, pot_id, kind, name, enabled, binding, max_run_ms, ml_per_second) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET room_id = excluded.room_id, pot_id = excluded.pot_id, kind = excluded.kind, name = excluded.name,
           enabled = excluded.enabled, binding = excluded.binding, max_run_ms = excluded.max_run_ms, ml_per_second = excluded.ml_per_second`,
      )
      .run(
        a.id,
        a.roomId,
        a.potId,
        a.kind,
        a.name,
        a.enabled ? 1 : 0,
        JSON.stringify(a.binding),
        a.maxRunMs,
        a.mlPerSecond,
      );
    return a;
  }

  // ── schedules ──────────────────────────────────────────────────────────────
  listSchedules(): Schedule[] {
    return (this.db.prepare('SELECT * FROM schedules ORDER BY id').all() as Row[]).map((r) =>
      Schedule.parse({ id: r['id'], target: json(r['target']), rule: json(r['rule']), enabled: bool(r['enabled']) }),
    );
  }
  /** Schedules whose target belongs to the room. */
  roomSchedules(roomId: string): Schedule[] {
    const probes = new Set(this.listProbes(roomId).map((p) => p.id));
    const actuators = new Set(this.listActuators(roomId).map((a) => a.id));
    return this.listSchedules().filter((s) =>
      s.target.type === 'probe' ? probes.has(s.target.probeId) : actuators.has(s.target.actuatorId),
    );
  }
  putSchedule(input: unknown): Schedule {
    const s = Schedule.parse(input);
    this.db
      .prepare(
        'INSERT INTO schedules (id, target, rule, enabled) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET target = excluded.target, rule = excluded.rule, enabled = excluded.enabled',
      )
      .run(s.id, JSON.stringify(s.target), JSON.stringify(s.rule), s.enabled ? 1 : 0);
    return s;
  }

  /**
   * Deletes one entity. Schedules that target a deleted probe or actuator (directly, or through a deleted room)
   * go with it, so no schedule points at nothing. A calendar still used by a room is refused by its foreign key.
   */
  deleteEntity(table: 'rooms' | 'pots' | 'probes' | 'actuators' | 'schedules' | 'calendars', id: string): boolean {
    return this.tx(() => {
      const probes = table === 'probes' ? [id] : table === 'rooms' ? this.listProbes(id).map((p) => p.id) : [];
      const actuators = table === 'actuators' ? [id] : table === 'rooms' ? this.listActuators(id).map((a) => a.id) : [];
      const deleted = Number(this.db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id).changes) > 0;
      if (deleted && (probes.length || actuators.length)) {
        for (const s of this.listSchedules()) {
          const t = s.target;
          if (
            (t.type === 'probe' && probes.includes(t.probeId)) ||
            (t.type === 'actuator' && actuators.includes(t.actuatorId))
          )
            this.db.prepare('DELETE FROM schedules WHERE id = ?').run(s.id);
        }
      }
      return deleted;
    });
  }

  /** Forgets an agent: its token stops working and its room is left without one. */
  deleteAgent(agentId: string): boolean {
    return this.tx(() => {
      this.db.prepare('UPDATE rooms SET agent_id = NULL WHERE agent_id = ?').run(agentId);
      return Number(this.db.prepare('DELETE FROM agents WHERE id = ?').run(agentId).changes) > 0;
    });
  }

  // ── agents ─────────────────────────────────────────────────────────────────
  /** Creates (or rotates) an agent's token. The token is returned once and only its hash is stored. */
  issueAgentToken(agentId: string): string {
    const token = randomBytes(24).toString('base64url');
    this.db
      .prepare(
        'INSERT INTO agents (id, token_hash, created_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET token_hash = excluded.token_hash',
      )
      .run(agentId, sha256(token), Date.now());
    return token;
  }
  checkAgentToken(agentId: string, token: string): boolean {
    const r = this.db.prepare('SELECT token_hash FROM agents WHERE id = ?').get(agentId) as Row | undefined;
    if (!r) return false;
    const a = Buffer.from(String(r['token_hash']), 'hex');
    const b = Buffer.from(sha256(token), 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  }
  listAgents(): { id: string; lastSeen: number | null; status: AgentStatus | null }[] {
    return (this.db.prepare('SELECT id, last_seen, last_status FROM agents ORDER BY id').all() as Row[]).map((r) => ({
      id: String(r['id']),
      lastSeen: r['last_seen'] == null ? null : Number(r['last_seen']),
      status: r['last_status'] == null ? null : AgentStatus.parse(json(r['last_status'])),
    }));
  }
  recordAgentStatus(agentId: string, status: AgentStatus): void {
    this.db
      .prepare('UPDATE agents SET last_seen = ?, last_status = ? WHERE id = ?')
      .run(Date.now(), JSON.stringify(status), agentId);
  }
  touchAgent(agentId: string): void {
    this.db.prepare('UPDATE agents SET last_seen = ? WHERE id = ?').run(Date.now(), agentId);
  }

  // ── telemetry ──────────────────────────────────────────────────────────────
  /** Idempotent: a replayed reading returns false. */
  addReading(input: unknown): boolean {
    const r = Reading.parse(input);
    return (
      Number(
        this.db
          .prepare('INSERT OR IGNORE INTO readings (probe_id, at, value) VALUES (?, ?, ?)')
          .run(r.probeId, r.at, r.value).changes,
      ) > 0
    );
  }
  readings(probeId: string, since: number, until = Number.MAX_SAFE_INTEGER, limit = 5000): Reading[] {
    return (
      this.db
        .prepare('SELECT * FROM readings WHERE probe_id = ? AND at >= ? AND at <= ? ORDER BY at LIMIT ?')
        .all(probeId, since, until, limit) as Row[]
    ).map((r) => ({
      probeId: String(r['probe_id']),
      at: Number(r['at']),
      value: Number(r['value']),
    }));
  }
  latestReadings(): Reading[] {
    return (
      this.db.prepare('SELECT probe_id, MAX(at) AS at, value FROM readings GROUP BY probe_id').all() as Row[]
    ).map((r) => ({ probeId: String(r['probe_id']), at: Number(r['at']), value: Number(r['value']) }));
  }
  latestReading(probeId: string): Reading | null {
    const r = this.db.prepare('SELECT * FROM readings WHERE probe_id = ? ORDER BY at DESC LIMIT 1').get(probeId) as
      Row | undefined;
    return r ? { probeId, at: Number(r['at']), value: Number(r['value']) } : null;
  }
  /** Idempotent: a replayed actuation returns false. */
  addActuation(input: unknown): boolean {
    const a = Actuation.parse(input);
    const res = this.db
      .prepare(
        'INSERT OR IGNORE INTO actuations (actuator_id, state, at, ran_ms, source, command_id) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .run(a.actuatorId, a.state, a.at, a.ranMs, a.source, a.commandId);
    return Number(res.changes) > 0;
  }
  actuations(since: number, actuatorId?: string, limit = 500): Actuation[] {
    const rows = (
      actuatorId
        ? this.db
            .prepare('SELECT * FROM actuations WHERE at >= ? AND actuator_id = ? ORDER BY at DESC LIMIT ?')
            .all(since, actuatorId, limit)
        : this.db.prepare('SELECT * FROM actuations WHERE at >= ? ORDER BY at DESC LIMIT ?').all(since, limit)
    ) as Row[];
    return rows.map((r) => ({
      actuatorId: String(r['actuator_id']),
      state: r['state'] as 'on' | 'off',
      at: Number(r['at']),
      ranMs: r['ran_ms'] == null ? null : Number(r['ran_ms']),
      source: r['source'] as Actuation['source'],
      commandId: r['command_id'] == null ? null : String(r['command_id']),
    }));
  }
  addFault(agentId: string, at: number, subject: string, message: string): boolean {
    return (
      Number(
        this.db
          .prepare('INSERT OR IGNORE INTO faults (agent_id, at, subject, message) VALUES (?, ?, ?, ?)')
          .run(agentId, at, subject, message).changes,
      ) > 0
    );
  }
  faults(since: number): { agentId: string; at: number; subject: string; message: string }[] {
    return (this.db.prepare('SELECT * FROM faults WHERE at >= ? ORDER BY at DESC LIMIT 200').all(since) as Row[]).map(
      (r) => ({
        agentId: String(r['agent_id']),
        at: Number(r['at']),
        subject: String(r['subject']),
        message: String(r['message']),
      }),
    );
  }

  // ── dose log (training data for the dosing model) ─────────────────────────
  /**
   * Records mL added. Additions of the same kind close together (within `mergeMs`) and still waiting
   * for their "after" reading are merged into one sample, so a multi-pump correction counts once.
   */
  addDose(
    d: {
      roomId: string;
      at: number;
      kind: 'nutrient' | 'ph_down';
      ml: number;
      liters: number;
      before: number | null;
      source: string;
    },
    mergeMs: number,
  ): void {
    const open = this.db
      .prepare(
        'SELECT id FROM doses WHERE room_id = ? AND kind = ? AND after IS NULL AND at >= ? ORDER BY at DESC LIMIT 1',
      )
      .get(d.roomId, d.kind, d.at - mergeMs) as Row | undefined;
    if (open) this.db.prepare('UPDATE doses SET ml = ml + ? WHERE id = ?').run(d.ml, open['id']!);
    else
      this.db
        .prepare(
          'INSERT INTO doses (room_id, at, kind, ml, liters, before, after, source) VALUES (?, ?, ?, ?, ?, ?, NULL, ?)',
        )
        .run(d.roomId, d.at, d.kind, d.ml, d.liters, d.before, d.source);
  }
  /** Closes doses of `kind` older than `mixMs` with the reading that follows them. */
  closeDoses(roomId: string, kind: 'nutrient' | 'ph_down', value: number, at: number, mixMs: number): number {
    return Number(
      this.db
        .prepare('UPDATE doses SET after = ? WHERE room_id = ? AND kind = ? AND after IS NULL AND at <= ?')
        .run(value, roomId, kind, at - mixMs).changes,
    );
  }
  doseSamples(
    roomId: string,
    kind: 'nutrient' | 'ph_down',
    limit = 50,
  ): { ml: number; liters: number; before: number; after: number }[] {
    return (
      this.db
        .prepare(
          'SELECT ml, liters, before, after FROM doses WHERE room_id = ? AND kind = ? AND before IS NOT NULL AND after IS NOT NULL ORDER BY at DESC LIMIT ?',
        )
        .all(roomId, kind, limit) as Row[]
    ).map((r) => ({
      ml: Number(r['ml']),
      liters: Number(r['liters']),
      before: Number(r['before']),
      after: Number(r['after']),
    }));
  }
  lastDoseAt(roomId: string, source: string): number | null {
    const r = this.db
      .prepare('SELECT MAX(at) AS at FROM doses WHERE room_id = ? AND source = ?')
      .get(roomId, source) as Row | undefined;
    return r?.['at'] == null ? null : Number(r['at']);
  }
}
