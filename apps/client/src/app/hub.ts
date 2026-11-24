import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Service, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type {
  Actuation,
  Actuator,
  AgentView,
  Breeder,
  Plant,
  Strain,
  Calendar,
  CommandResult,
  Alert,
  FeedView,
  LiveEvent,
  OperatingMode,
  Phase,
  Pot,
  Probe,
  ProbeKind,
  Reading,
  Room,
  Schedule,
} from '@grover/contracts';

export type FeedPreview =
  | {
      ok: true;
      batchLiters: number;
      ml: Record<string, number>;
      notes: string[];
      ec: number | null;
      ph: number | null;
      potLitersBefore: number;
      expected: { ec: number | null; ph: number | null };
    }
  | { ok: false; reason: string; ec: number | null; ph: number | null };

export interface Snapshot {
  rooms: (Room & { phase: { phase: Phase; day: number } | null })[];
  pots: Pot[];
  probes: Probe[];
  actuators: Actuator[];
  schedules: Schedule[];
  calendars: Calendar[];
  agents: AgentView[];
  latest: Reading[];
  alerts: Alert[];
  feeds: FeedView[];
  /** The phase each pot is fed for: its plant's own, or the tent's (null: none). */
  potPhases: Record<string, { phase: Phase; day: number; source: 'plant' | 'tent'; plantId: string | null } | null>;
  breeders: Breeder[];
  strains: Strain[];
  plants: Plant[];
  probeKinds: Record<ProbeKind, { unit: string; min: number; max: number; title: string }>;
}

const CACHE_KEY = 'grover.snapshot';

function readCache(): Snapshot | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Snapshot) : null;
  } catch {
    return null;
  }
}

/**
 * The client's view of the hub: one snapshot, kept current by the live WebSocket.
 * When the hub is unreachable the last snapshot stays on screen and actions are disabled.
 */
@Service()
export class Hub {
  private readonly http = inject(HttpClient);
  private socket: WebSocket | null = null;
  private retry: ReturnType<typeof setTimeout> | null = null;

  readonly snapshot = signal<Snapshot | null>(readCache());
  readonly connected = signal(false);
  readonly lastError = signal<string | null>(null);
  readonly busy = signal<ReadonlySet<string>>(new Set());
  /** Actuators currently on, per the agents' reports and live actuations. */
  readonly active = signal<ReadonlySet<string>>(new Set());
  readonly recent = signal<Actuation[]>([]);

  readonly latest = computed(() => new Map((this.snapshot()?.latest ?? []).map((r) => [r.probeId, r])));
  readonly rooms = computed(() => this.snapshot()?.rooms ?? []);

  constructor() {
    void this.refresh();
    this.connect();
    inject(DestroyRef).onDestroy(() => {
      if (this.retry) clearTimeout(this.retry);
      this.socket?.close();
    });
  }

  async refresh(): Promise<void> {
    try {
      const snap = await firstValueFrom(this.http.get<Snapshot>('/api/snapshot'));
      this.snapshot.set(snap);
      this.active.set(new Set(snap.agents.flatMap((a) => (a.online ? (a.status?.active ?? []) : []))));
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(snap));
      } catch {
        /* storage unavailable: fine */
      }
    } catch {
      this.connected.set(false);
    }
  }

  private connect(): void {
    const url = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/live`;
    const ws = new WebSocket(url);
    this.socket = ws;
    ws.onopen = () => {
      this.connected.set(true);
      void this.refresh();
    };
    ws.onmessage = (msg) => this.apply(JSON.parse(String(msg.data)) as LiveEvent);
    ws.onclose = () => {
      this.connected.set(false);
      this.retry = setTimeout(() => this.connect(), 3000);
    };
  }

  private apply(ev: LiveEvent): void {
    const snap = this.snapshot();
    if (!snap) return;
    switch (ev.type) {
      case 'reading':
        this.snapshot.set({
          ...snap,
          latest: [...snap.latest.filter((r) => r.probeId !== ev.reading.probeId), ev.reading],
        });
        break;
      case 'actuation': {
        const next = new Set(this.active());
        if (ev.actuation.state === 'on') next.add(ev.actuation.actuatorId);
        else next.delete(ev.actuation.actuatorId);
        this.active.set(next);
        this.recent.update((list) => [ev.actuation, ...list].slice(0, 30));
        break;
      }
      case 'agent':
        this.snapshot.set({
          ...snap,
          agents: [...snap.agents.filter((a) => a.agentId !== ev.agent.agentId), ev.agent],
        });
        break;
      case 'room':
        this.snapshot.set({
          ...snap,
          rooms: snap.rooms.map((r) => (r.id === ev.roomId ? { ...r, mode: ev.mode } : r)),
        });
        break;
      case 'feed':
        this.snapshot.set({ ...snap, feeds: [ev.feed, ...snap.feeds.filter((f) => f.feedId !== ev.feed.feedId)] });
        break;
      case 'alert':
        this.snapshot.set({
          ...snap,
          alerts: ev.cleared
            ? snap.alerts.filter((a) => a.key !== ev.alert.key)
            : [ev.alert, ...snap.alerts.filter((a) => a.key !== ev.alert.key)],
        });
        break;
      case 'fault':
        this.lastError.set(`${ev.subject}: ${ev.message}`);
        break;
    }
  }

  agentFor(room: Room): AgentView | null {
    return this.snapshot()?.agents.find((a) => a.agentId === room.agentId) ?? null;
  }

  // ── actions ──────────────────────────────────────────────────────────────
  private async act<T>(key: string, call: () => Promise<T>): Promise<T | null> {
    this.busy.update((s) => new Set(s).add(key));
    this.lastError.set(null);
    try {
      const out = await call();
      const result = out as Partial<CommandResult> | null;
      if (result && result.ok === false) this.lastError.set(result.error ?? 'refused by the agent');
      return out;
    } catch (err) {
      const e = err as HttpErrorResponse;
      this.lastError.set(e.error?.error ?? e.message);
      return null;
    } finally {
      this.busy.update((s) => {
        const n = new Set(s);
        n.delete(key);
        return n;
      });
    }
  }

  read(probeId: string) {
    return this.act(`probe:${probeId}`, () =>
      firstValueFrom(this.http.post<CommandResult>(`/api/probes/${probeId}/read`, {})),
    );
  }
  run(actuatorId: string, body: { durationMs: number } | { ml: number }) {
    return this.act(`act:${actuatorId}`, () =>
      firstValueFrom(this.http.post<CommandResult>(`/api/actuators/${actuatorId}/run`, body)),
    );
  }
  switch(actuatorId: string, on: boolean) {
    return this.act(`act:${actuatorId}`, () =>
      firstValueFrom(this.http.post<CommandResult>(`/api/actuators/${actuatorId}/switch`, { on })),
    );
  }
  stop(roomId: string) {
    return this.act(`room:${roomId}`, () =>
      firstValueFrom(this.http.post<CommandResult>(`/api/rooms/${roomId}/stop`, {})),
    );
  }
  setMode(roomId: string, mode: OperatingMode) {
    return this.act(`room:${roomId}`, () => firstValueFrom(this.http.put<Room>(`/api/rooms/${roomId}/mode`, { mode })));
  }
  /** What a feed of this pot would mix now, or why it would be refused. */
  feedPreview(potId: string) {
    return firstValueFrom(this.http.get<FeedPreview>(`/api/pots/${potId}/feed`));
  }
  feed(potId: string) {
    return this.act(`feed:${potId}`, async () => {
      const feed = await firstValueFrom(this.http.post<FeedView>(`/api/pots/${potId}/feed`, {}));
      if (feed.state === 'refused') this.lastError.set(`Feed refused: ${feed.message}`);
      return feed;
    });
  }
  takeCuttings(plantId: string, count: number) {
    return this.act(`plant:${plantId}`, async () => {
      const r = await firstValueFrom(
        this.http.post<{ plants: Plant[]; warning: string | null }>(`/api/plants/${plantId}/cuttings`, { count }),
      );
      await this.refresh();
      if (r.warning) this.lastError.set(`Cuttings recorded. Note: ${r.warning}.`);
      return r;
    });
  }
  harvest(plantId: string) {
    return this.act(`plant:${plantId}`, async () => {
      const r = await firstValueFrom(this.http.post<Plant>(`/api/plants/${plantId}/harvest`, {}));
      await this.refresh();
      return r;
    });
  }
  place(potId: string, plantId: string) {
    return this.act(`pot:${potId}`, async () => {
      const r = await firstValueFrom(this.http.post<Plant>(`/api/pots/${potId}/place`, { plantId }));
      await this.refresh();
      return r;
    });
  }
  readings(probeId: string, since: number) {
    return firstValueFrom(this.http.get<Reading[]>(`/api/probes/${probeId}/readings`, { params: { since } }));
  }
}
