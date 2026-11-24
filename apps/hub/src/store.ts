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
  Breeder,
  Strain,
  Plant,
  type Alert,
  type FeedView,
  type ProbeKind,
  type TankRoleId,
} from '@grover/contracts';
import { z } from 'zod';

type Row = Record<string, SQLInputValue>;
const bool = (v: unknown) => v === 1 || v === 1n;
const json = (v: unknown) => JSON.parse(String(v));
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export class NotFound extends Error {}
/** A delete refused because something still refers to it. */
export class InUse extends Error {}
/** A save that refers to something that does not exist (or would make a loop). */
export class BadReference extends Error {}

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
      autoFeed: bool(r['auto_feed']),
      calendarId: r['calendar_id'] == null ? null : String(r['calendar_id']),
      calendarStart: r['calendar_start'] == null ? null : String(r['calendar_start']),
      mixEmptyLevel: Number(r['mix_empty_level']),
      mixSettleSeconds: Number(r['mix_settle_seconds']),
      feedCooldownMinutes: Number(r['feed_cooldown_minutes']),
      waterEc: Number(r['water_ec']),
      waterPh: Number(r['water_ph']),
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
        `INSERT INTO rooms (id, name, agent_id, mode, auto_feed, calendar_id, calendar_start, mix_empty_level, mix_settle_seconds,
           feed_cooldown_minutes, water_ec, water_ph)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, agent_id = excluded.agent_id, mode = excluded.mode, auto_feed = excluded.auto_feed,
           calendar_id = excluded.calendar_id, calendar_start = excluded.calendar_start, mix_empty_level = excluded.mix_empty_level,
           mix_settle_seconds = excluded.mix_settle_seconds, feed_cooldown_minutes = excluded.feed_cooldown_minutes,
           water_ec = excluded.water_ec, water_ph = excluded.water_ph`,
      )
      .run(
        r.id,
        r.name,
        r.agentId,
        r.mode,
        r.autoFeed ? 1 : 0,
        r.calendarId,
        r.calendarStart,
        r.mixEmptyLevel,
        r.mixSettleSeconds,
        r.feedCooldownMinutes,
        r.waterEc,
        r.waterPh,
      );
    return r;
  }

  // ── pots ───────────────────────────────────────────────────────────────────
  listPots(roomId?: string): Pot[] {
    const rows = (
      roomId
        ? this.db.prepare('SELECT * FROM pots WHERE room_id = ? ORDER BY name').all(roomId)
        : this.db.prepare('SELECT * FROM pots ORDER BY name').all()
    ) as Row[];
    return rows.map((r) => ({
      id: String(r['id']),
      roomId: String(r['room_id']),
      name: String(r['name']),
      liters: Number(r['liters']),
      feedLiters: Number(r['feed_liters']),
      litersPerCm: r['liters_per_cm'] == null ? null : Number(r['liters_per_cm']),
    }));
  }
  getPot(id: string): Pot {
    const pot = this.listPots().find((p) => p.id === id);
    if (!pot) throw new NotFound(`pot ${id}`);
    return pot;
  }
  putPot(input: unknown): Pot {
    const p = Pot.parse(input);
    this.db
      .prepare(
        `INSERT INTO pots (id, room_id, name, liters, feed_liters, liters_per_cm) VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET room_id = excluded.room_id, name = excluded.name, liters = excluded.liters,
           feed_liters = excluded.feed_liters, liters_per_cm = excluded.liters_per_cm`,
      )
      .run(p.id, p.roomId, p.name, p.liters, p.feedLiters, p.litersPerCm);
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
      tank: r['tank'] ?? null,
      alertBelow: r['alert_below'] ?? null,
      alertAbove: r['alert_above'] ?? null,
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
  /**
   * The probe that reads `kind` for a pot: the pot's own, else the tent's shared one (no pot, no tank).
   * Level probes never fall back: a tent-wide level would say nothing about one pot.
   */
  potProbe(pot: Pot, kind: ProbeKind): Probe | null {
    const all = this.listProbes(pot.roomId).filter((p) => p.kind === kind && p.enabled && p.tank === null);
    const own = all.find((p) => p.potId === pot.id);
    if (own || kind === 'water_level') return own ?? null;
    return all.find((p) => p.potId === null) ?? null;
  }
  /** Level probes of the tent's tanks, by role. */
  tankProbes(roomId: string): Partial<Record<TankRoleId, Probe>> {
    const out: Partial<Record<TankRoleId, Probe>> = {};
    for (const p of this.listProbes(roomId)) if (p.tank && p.enabled && p.kind === 'water_level') out[p.tank] ??= p;
    return out;
  }
  putProbe(input: unknown): Probe {
    const p = Probe.parse(input);
    this.db
      .prepare(
        `INSERT INTO probes (id, room_id, pot_id, kind, name, enabled, binding, tank, alert_below, alert_above) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET room_id = excluded.room_id, pot_id = excluded.pot_id, kind = excluded.kind, name = excluded.name,
           enabled = excluded.enabled, binding = excluded.binding, tank = excluded.tank, alert_below = excluded.alert_below,
           alert_above = excluded.alert_above`,
      )
      .run(
        p.id,
        p.roomId,
        p.potId,
        p.kind,
        p.name,
        p.enabled ? 1 : 0,
        JSON.stringify(p.binding),
        p.tank,
        p.alertBelow,
        p.alertAbove,
      );
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
   * Deletes one entity. A pot takes its probes and actuators with it. Schedules that target a deleted probe or
   * actuator (directly, or through a deleted room or pot)
   * go with it, so no schedule points at nothing. A calendar still used by a room is refused by its foreign key.
   */
  deleteEntity(
    table: 'rooms' | 'pots' | 'probes' | 'actuators' | 'schedules' | 'calendars' | 'breeders' | 'strains' | 'plants',
    id: string,
  ): boolean {
    return this.tx(() => {
      if (table === 'strains') {
        const child = this.listStrains().find((s) => s.parentIds.includes(id));
        if (child) throw new InUse(`${child.name} lists it as a parent: change that first`);
      }
      const probes =
        table === 'probes'
          ? [id]
          : table === 'rooms'
            ? this.listProbes(id).map((p) => p.id)
            : table === 'pots'
              ? this.listProbes()
                  .filter((p) => p.potId === id)
                  .map((p) => p.id)
              : [];
      const actuators =
        table === 'actuators'
          ? [id]
          : table === 'rooms'
            ? this.listActuators(id).map((a) => a.id)
            : table === 'pots'
              ? this.listActuators()
                  .filter((a) => a.potId === id)
                  .map((a) => a.id)
              : [];
      // A pot's probes and pumps go with it: left behind without a pot, its pH/EC probes would become the
      // tent's shared pair and its feed pump an unassigned one.
      if (table === 'pots') {
        for (const p of probes) this.db.prepare('DELETE FROM probes WHERE id = ?').run(p);
        for (const a of actuators) this.db.prepare('DELETE FROM actuators WHERE id = ?').run(a);
      }
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

  // ── breeders, strains, plants ──────────────────────────────────────────────
  listBreeders(): Breeder[] {
    return (this.db.prepare('SELECT * FROM breeders ORDER BY name').all() as Row[]).map((r) =>
      Breeder.parse({ id: r['id'], name: r['name'], website: r['website'] ?? null, notes: r['notes'] }),
    );
  }
  putBreeder(input: unknown): Breeder {
    const b = Breeder.parse(input);
    this.db
      .prepare(
        `INSERT INTO breeders (id, name, website, notes) VALUES (?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, website = excluded.website, notes = excluded.notes`,
      )
      .run(b.id, b.name, b.website, b.notes);
    return b;
  }
  listStrains(): Strain[] {
    return (this.db.prepare('SELECT * FROM strains ORDER BY name').all() as Row[]).map((r) =>
      Strain.parse({
        id: r['id'],
        name: r['name'],
        breederId: r['breeder_id'] ?? null,
        parentIds: json(r['parent_ids']),
        sativaPercent: r['sativa_percent'] ?? null,
        thcPercent: r['thc_percent'] ?? null,
        cbdPercent: r['cbd_percent'] ?? null,
        floweringDays: r['flowering_days'] ?? null,
        autoflower: bool(r['autoflower']),
        notes: r['notes'],
      }),
    );
  }
  putStrain(input: unknown): Strain {
    const s = Strain.parse(input);
    const strains = this.listStrains();
    if (s.breederId && !this.listBreeders().some((b) => b.id === s.breederId))
      throw new BadReference(`unknown breeder ${s.breederId}`);
    for (const p of s.parentIds) if (!strains.some((x) => x.id === p)) throw new BadReference(`unknown strain ${p}`);
    // No loops in the ancestry: walk up from the new parents.
    const parentsOf = new Map(strains.map((x) => [x.id, x.parentIds]));
    parentsOf.set(s.id, s.parentIds);
    const stack = [...s.parentIds];
    const seen = new Set<string>();
    while (stack.length) {
      const id = stack.pop()!;
      if (id === s.id) throw new BadReference(`${s.name} would be its own ancestor`);
      if (seen.has(id)) continue;
      seen.add(id);
      stack.push(...(parentsOf.get(id) ?? []));
    }
    this.db
      .prepare(
        `INSERT INTO strains (id, name, breeder_id, parent_ids, sativa_percent, thc_percent, cbd_percent, flowering_days, autoflower, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, breeder_id = excluded.breeder_id, parent_ids = excluded.parent_ids,
           sativa_percent = excluded.sativa_percent, thc_percent = excluded.thc_percent, cbd_percent = excluded.cbd_percent,
           flowering_days = excluded.flowering_days, autoflower = excluded.autoflower, notes = excluded.notes`,
      )
      .run(
        s.id,
        s.name,
        s.breederId,
        JSON.stringify(s.parentIds),
        s.sativaPercent,
        s.thcPercent,
        s.cbdPercent,
        s.floweringDays,
        s.autoflower ? 1 : 0,
        s.notes,
      );
    return s;
  }
  listPlants(): Plant[] {
    return (this.db.prepare('SELECT * FROM plants ORDER BY name').all() as Row[]).map((r) =>
      Plant.parse({
        id: r['id'],
        name: r['name'],
        strainId: r['strain_id'] ?? null,
        breederId: r['breeder_id'] ?? null,
        generation: Number(r['generation']),
        motherId: r['mother_id'] ?? null,
        potId: r['pot_id'] ?? null,
        medium: r['medium'] ?? null,
        startedOn: r['started_on'] ?? null,
        trimmedOn: r['trimmed_on'] ?? null,
        bloomOn: r['bloom_on'] ?? null,
        flushOn: r['flush_on'] ?? null,
        harvestedOn: r['harvested_on'] ?? null,
        yieldGrams: r['yield_grams'] ?? null,
        notes: r['notes'],
      }),
    );
  }
  /** The plant growing in a pot now (not harvested), if any. */
  plantInPot(potId: string): Plant | null {
    return this.listPlants().find((p) => p.potId === potId && p.harvestedOn === null) ?? null;
  }
  putPlant(input: unknown): Plant {
    const p = Plant.parse(input);
    if (p.strainId && !this.listStrains().some((x) => x.id === p.strainId))
      throw new BadReference(`unknown strain ${p.strainId}`);
    if (p.breederId && !this.listBreeders().some((x) => x.id === p.breederId))
      throw new BadReference(`unknown breeder ${p.breederId}`);
    if (p.motherId && !this.listPlants().some((x) => x.id === p.motherId))
      throw new BadReference(`unknown mother plant ${p.motherId}`);
    if (p.potId && !this.listPots().some((x) => x.id === p.potId)) throw new BadReference(`unknown pot ${p.potId}`);
    // A pot holds one growing plant (F-013); a harvested plant keeps its pot as history.
    if (p.potId && p.harvestedOn === null) {
      const other = this.listPlants().find((x) => x.potId === p.potId && x.harvestedOn === null && x.id !== p.id);
      if (other) throw new BadReference(`${p.potId} already holds ${other.name}: harvest it or move it first`);
    }
    this.db
      .prepare(
        `INSERT INTO plants (id, name, strain_id, breeder_id, generation, mother_id, pot_id, medium, started_on, trimmed_on, bloom_on,
           flush_on, harvested_on, yield_grams, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, strain_id = excluded.strain_id, breeder_id = excluded.breeder_id,
           generation = excluded.generation, mother_id = excluded.mother_id, pot_id = excluded.pot_id, medium = excluded.medium,
           started_on = excluded.started_on, trimmed_on = excluded.trimmed_on, bloom_on = excluded.bloom_on,
           flush_on = excluded.flush_on, harvested_on = excluded.harvested_on, yield_grams = excluded.yield_grams, notes = excluded.notes`,
      )
      .run(
        p.id,
        p.name,
        p.strainId,
        p.breederId,
        p.generation,
        p.motherId,
        p.potId,
        p.medium,
        p.startedOn,
        p.trimmedOn,
        p.bloomOn,
        p.flushOn,
        p.harvestedOn,
        p.yieldGrams,
        p.notes,
      );
    return p;
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

  // ── feeds ──────────────────────────────────────────────────────────────────
  private feed(r: Row): FeedView {
    const num = (k: string) => (r[k] == null ? null : Number(r[k]));
    return {
      feedId: String(r['id']),
      roomId: String(r['room_id']),
      potId: String(r['pot_id']),
      source: r['source'] as FeedView['source'],
      state: r['state'] as FeedView['state'],
      message: String(r['message']),
      requestedAt: Number(r['requested_at']),
      finishedAt: num('finished_at'),
      batchLiters: num('batch_liters'),
      ml: r['ml'] == null ? null : (json(r['ml']) as Record<string, number>),
      ecBefore: num('ec_before'),
      phBefore: num('ph_before'),
      ecAfter: num('ec_after'),
      phAfter: num('ph_after'),
      potLitersBefore: num('pot_liters_before'),
      expectedEc: num('expected_ec'),
      expectedPh: num('expected_ph'),
    };
  }
  addFeed(f: FeedView): void {
    this.db
      .prepare(
        `INSERT INTO feeds (id, room_id, pot_id, source, state, message, requested_at, finished_at, batch_liters, ml, ec_before, ph_before,
           pot_liters_before, expected_ec, expected_ph)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        f.feedId,
        f.roomId,
        f.potId,
        f.source,
        f.state,
        f.message,
        f.requestedAt,
        f.finishedAt,
        f.batchLiters,
        f.ml ? JSON.stringify(f.ml) : null,
        f.ecBefore,
        f.phBefore,
        f.potLitersBefore,
        f.expectedEc,
        f.expectedPh,
      );
  }
  getFeed(feedId: string): FeedView | null {
    const r = this.db.prepare('SELECT * FROM feeds WHERE id = ?').get(feedId) as Row | undefined;
    return r ? this.feed(r) : null;
  }
  /** Moves a feed on; a finished state is final (a late `step` after `aborted` changes nothing). */
  updateFeed(feedId: string, state: FeedView['state'], message: string, at: number): FeedView | null {
    const final = state === 'done' || state === 'aborted' || state === 'refused';
    this.db
      .prepare(
        `UPDATE feeds SET state = ?, message = ?, finished_at = CASE WHEN ? THEN ? ELSE finished_at END
         WHERE id = ? AND state NOT IN ('done', 'aborted', 'refused')`,
      )
      .run(state, message, final ? 1 : 0, at, feedId);
    return this.getFeed(feedId);
  }
  feeds(since: number, potId?: string, limit = 200): FeedView[] {
    const rows = (
      potId
        ? this.db
            .prepare('SELECT * FROM feeds WHERE requested_at >= ? AND pot_id = ? ORDER BY requested_at DESC LIMIT ?')
            .all(since, potId, limit)
        : this.db
            .prepare('SELECT * FROM feeds WHERE requested_at >= ? ORDER BY requested_at DESC LIMIT ?')
            .all(since, limit)
    ) as Row[];
    return rows.map((r) => this.feed(r));
  }
  /** A feed still waiting for its "after" reading, finished at least `mixMs` before `at`. */
  feedsAwaitingAfter(potId: string, kind: 'ec' | 'ph', at: number, mixMs: number): FeedView[] {
    const col = kind === 'ec' ? 'ec_after' : 'ph_after';
    return (
      this.db
        .prepare(`SELECT * FROM feeds WHERE pot_id = ? AND state = 'done' AND ${col} IS NULL AND finished_at <= ?`)
        .all(potId, at - mixMs) as Row[]
    ).map((r) => this.feed(r));
  }
  setFeedAfter(feedId: string, kind: 'ec' | 'ph', value: number): void {
    this.db.prepare(`UPDATE feeds SET ${kind === 'ec' ? 'ec_after' : 'ph_after'} = ? WHERE id = ?`).run(value, feedId);
  }
  /** Finished feeds with readings on both sides, for the dosing model. */
  feedSamples(roomId: string, limit = 50): FeedView[] {
    return (
      this.db
        .prepare(`SELECT * FROM feeds WHERE room_id = ? AND state = 'done' ORDER BY requested_at DESC LIMIT ?`)
        .all(roomId, limit) as Row[]
    ).map((r) => this.feed(r));
  }
  /** Feeds not yet finished, in a room or anywhere. */
  openFeeds(roomId?: string): FeedView[] {
    const rows = (
      roomId
        ? this.db.prepare("SELECT * FROM feeds WHERE state IN ('planned', 'started') AND room_id = ?").all(roomId)
        : this.db.prepare("SELECT * FROM feeds WHERE state IN ('planned', 'started')").all()
    ) as Row[];
    return rows.map((r) => this.feed(r));
  }
  lastFeedAt(potId: string): number | null {
    const r = this.db
      .prepare(`SELECT MAX(requested_at) AS at FROM feeds WHERE pot_id = ? AND state != 'refused'`)
      .get(potId) as Row | undefined;
    return r?.['at'] == null ? null : Number(r['at']);
  }

  // ── alerts ─────────────────────────────────────────────────────────────────
  /** Raises an alert; false when it was already active (nothing new to tell). */
  raiseAlert(a: Alert): boolean {
    const res = this.db
      .prepare('INSERT OR IGNORE INTO alerts (key, room_id, pot_id, level, message, since) VALUES (?, ?, ?, ?, ?, ?)')
      .run(a.key, a.roomId, a.potId, a.level, a.message, a.since);
    if (Number(res.changes) > 0) return true;
    this.db.prepare('UPDATE alerts SET message = ?, level = ? WHERE key = ?').run(a.message, a.level, a.key);
    return false;
  }
  /** Clears an alert; returns it when it was active. */
  clearAlert(key: string): Alert | null {
    const found = this.alerts().find((a) => a.key === key) ?? null;
    if (found) this.db.prepare('DELETE FROM alerts WHERE key = ?').run(key);
    return found;
  }
  alerts(): Alert[] {
    return (this.db.prepare('SELECT * FROM alerts ORDER BY since DESC').all() as Row[]).map((r) => ({
      key: String(r['key']),
      roomId: String(r['room_id']),
      potId: r['pot_id'] == null ? null : String(r['pot_id']),
      level: r['level'] as Alert['level'],
      message: String(r['message']),
      since: Number(r['since']),
    }));
  }
}
