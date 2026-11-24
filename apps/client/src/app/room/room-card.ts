import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Actuator, FeedView, OperatingMode, Phase, Pot, Probe } from '@grover/contracts';
import { TANK_ROLES, TANK_TITLES, generationLabel, geneticsLabel, isPump } from '@grover/contracts/kinds';
import { Clock } from '../clock';
import { ago, health, targetRange, type Health } from '../format';
import { Hub, type FeedPreview, type Snapshot } from '../hub';

type RoomView = Snapshot['rooms'][number];

export interface Tile {
  probe: Probe;
  title: string;
  unit: string;
  value: number | undefined;
  range: { min: number; max: number } | null;
  health: Health;
  ago: string;
  /** Read from the tent's shared probe, not the pot's own. */
  shared: boolean;
}

/** One tent: its own probes, the tanks, each pot with its feed, switches and manual pump runs. */
@Component({
  selector: 'gr-room-card',
  imports: [DecimalPipe, NgTemplateOutlet, RouterLink],
  templateUrl: './room-card.html',
  styleUrl: './room-card.scss',
})
export class RoomCard {
  protected readonly hub = inject(Hub);
  private readonly clock = inject(Clock);
  readonly room = input.required<RoomView>();

  protected readonly modes: OperatingMode[] = ['normal', 'silent', 'off'];
  protected readonly agent = computed(() => this.hub.agentFor(this.room()));
  protected readonly online = computed(() => this.hub.connected() && !!this.agent()?.online);
  protected readonly phase = computed(() => this.room().phase?.phase ?? null);
  protected readonly canAct = computed(() => this.online() && this.room().mode === 'normal');

  private readonly snap = this.hub.snapshot;
  private readonly probes = computed(() =>
    (this.snap()?.probes ?? []).filter((p) => p.roomId === this.room().id && p.enabled),
  );
  private readonly actuators = computed(() =>
    (this.snap()?.actuators ?? []).filter((a) => a.roomId === this.room().id && a.enabled),
  );

  protected readonly alerts = computed(() => (this.snap()?.alerts ?? []).filter((a) => a.roomId === this.room().id));

  /** Probes of the tent itself: air, and the shared pH/EC pair. */
  protected readonly tentTiles = computed(() =>
    this.probes()
      .filter((p) => p.potId === null && p.tank === null)
      .map((p) => this.tile(p, false)),
  );

  protected readonly tankTiles = computed(() => {
    const byRole = new Map(
      this.probes()
        .filter((p) => p.tank)
        .map((p) => [p.tank, p]),
    );
    return TANK_ROLES.flatMap((role) => {
      const p = byRole.get(role);
      if (!p) return [];
      const t = this.tile(p, false);
      return [
        {
          ...t,
          title: TANK_TITLES[role],
          low: p.alertBelow !== null && t.value !== undefined && t.value < p.alertBelow,
        },
      ];
    });
  });

  protected readonly feedRunning = computed(() =>
    (this.snap()?.feeds ?? []).some(
      (f) => f.roomId === this.room().id && (f.state === 'planned' || f.state === 'started'),
    ),
  );

  protected readonly pots = computed(() => {
    const all = this.probes();
    const shared = (kind: Probe['kind']) => all.find((p) => p.potId === null && p.tank === null && p.kind === kind);
    const feeds = this.snap()?.feeds ?? [];
    return (this.snap()?.pots ?? [])
      .filter((p) => p.roomId === this.room().id)
      .map((pot) => {
        const own = (kind: Probe['kind']) => all.find((p) => p.potId === pot.id && p.kind === kind);
        // Each pot is fed for its own plant's phase (F-013), so its readings are judged against it.
        const potPhase = this.snap()?.potPhases?.[pot.id] ?? null;
        const phase = potPhase?.phase ?? this.phase();
        const tiles: Tile[] = [];
        const level = own('water_level');
        if (level) tiles.push(this.tile(level, false, phase));
        for (const kind of ['ph', 'ec'] as const) {
          const p = own(kind) ?? shared(kind);
          if (p) tiles.push(this.tile(p, !own(kind), phase));
        }
        const temp = own('water_temperature');
        if (temp) tiles.push(this.tile(temp, false, phase));
        const strains = this.snap()?.strains ?? [];
        const breeders = this.snap()?.breeders ?? [];
        const plants = (this.snap()?.plants ?? [])
          .filter((p) => p.potId === pot.id && p.harvestedOn === null)
          .map((p) => {
            const strain = strains.find((s) => s.id === p.strainId);
            const breeder = breeders.find((b) => b.id === (p.breederId ?? strain?.breederId));
            const facts = [
              generationLabel(p.generation),
              breeder?.name,
              strain ? geneticsLabel(strain.sativaPercent) : null,
              strain?.thcPercent != null ? `THC ${strain.thcPercent} %` : null,
            ].filter(Boolean);
            return {
              id: p.id,
              name: p.name,
              strain: strain?.name ?? null,
              facts: facts.join(' · '),
              generation: p.generation,
              canBloom: !p.bloomOn,
              canFlush: !!p.bloomOn && !p.flushOn,
            };
          });
        return {
          pot,
          plants,
          phaseLabel: potPhase
            ? `${potPhase.phase.name} · day ${potPhase.day}${
                potPhase.source === 'plant'
                  ? ''
                  : potPhase.plantId
                    ? ' (tent calendar: its plant has no start date yet)'
                    : ' (tent calendar)'
              }`
            : null,
          tiles,
          lastFeed: feeds.find((f) => f.potId === pot.id) ?? null,
          loop: this.actuators().find((a) => a.potId === pot.id && a.kind === 'water_loop') ?? null,
          canFeed: this.actuators().some((a) => a.potId === pot.id && a.kind === 'pump_transfer'),
        };
      });
  });

  protected readonly switches = computed(() => this.actuators().filter((a) => !isPump(a.kind)));
  protected readonly pumps = computed(() => this.actuators().filter((a) => isPump(a.kind)));

  protected readonly agentLabel = computed(() => {
    const a = this.agent();
    if (!this.hub.connected()) return 'Hub unreachable: showing the last known data';
    if (!a) return 'No agent assigned';
    if (!a.online) return `Agent ${a.agentId} offline, last seen ${ago(a.lastSeen, this.clock.now())}`;
    return a.configCurrent ? `Agent ${a.agentId} online` : `Agent ${a.agentId} online, applying new settings`;
  });

  protected readonly pumpAmount = signal<Record<string, number>>({});
  protected readonly previews = signal<Record<string, FeedPreview | 'loading'>>({});

  private tile(probe: Probe, shared: boolean, phase: Phase | null = this.phase()): Tile {
    const snap = this.snap();
    const r = this.hub.latest().get(probe.id);
    const now = this.clock.now();
    // Phase ranges apply to pots (and the shared pair); tank levels have their own alert thresholds.
    const range = probe.tank ? null : targetRange(probe.kind, phase);
    return {
      probe,
      title: probe.name,
      unit: snap?.probeKinds[probe.kind].unit ?? '',
      value: r?.value,
      range,
      health: health(r?.value, range, r?.at, now),
      ago: ago(r?.at, now),
      shared,
    };
  }

  /** What the mode allows to switch on: everything in normal, lights in silent, nothing when off. Off is always allowed. */
  protected canSwitchOn(a: Actuator): boolean {
    const mode = this.room().mode;
    return mode === 'normal' || (mode === 'silent' && a.kind === 'light');
  }

  /** Plants growing elsewhere, ready to go into a free pot. */
  protected readonly nursery = computed(() =>
    (this.snap()?.plants ?? []).filter((p) => p.potId === null && p.harvestedOn === null),
  );
  protected readonly placeChoice = signal<Record<string, string>>({});

  protected async cuttings(plantId: string, name: string): Promise<void> {
    const answer = prompt(`How many cuttings from ${name}?`, '4');
    if (answer === null) return;
    const count = Number(answer);
    if (!Number.isInteger(count) || count < 1 || count > 20) {
      this.hub.lastError.set('Cuttings: give a whole number from 1 to 20.');
      return;
    }
    await this.hub.takeCuttings(plantId, count);
  }

  protected async harvest(plantId: string, name: string): Promise<void> {
    if (confirm(`Record ${name} as harvested today? Its pot becomes free.`)) await this.hub.harvest(plantId);
  }

  protected async place(pot: Pot): Promise<void> {
    // A remembered choice may be stale (the plant was placed elsewhere): fall back to the first one available.
    const wanted = this.placeChoice()[pot.id];
    const plantId = this.nursery().some((p) => p.id === wanted) ? wanted : this.nursery()[0]?.id;
    if (plantId) await this.hub.place(pot.id, plantId);
    this.placeChoice.update((m) => {
      const { [pot.id]: _drop, ...rest } = m;
      return rest;
    });
  }

  protected choose(potId: string, plantId: string): void {
    this.placeChoice.update((m) => ({ ...m, [potId]: plantId }));
  }

  /** "Light: 12 h from 06:00 · Late bloom of NL5xHaze gen 2", or null on the tent's own schedules. */
  protected readonly lightLabel = computed(() => {
    const l = this.room().light;
    if (!l)
      return this.room().lightFallback
        ? 'Light: set to follow the calendar, but there is no phase to follow: its own schedules run'
        : null;
    const plant = l.plantId ? (this.snap()?.plants ?? []).find((p) => p.id === l.plantId)?.name : null;
    const when =
      l.rule.kind === 'dark' ? 'off all day' : l.hours >= 24 ? 'on all day' : `${l.hours} h from ${l.rule.from}`;
    return `Light: ${when} · ${l.phaseName}${plant ? ` of ${plant}${l.picked ? '' : ' (most advanced)'}` : ' (tent calendar)'}`;
  });

  protected async bloom(plantId: string, name: string): Promise<void> {
    if (confirm(`Record that ${name} switched to bloom today? Its feed moves to the flowering phases.`))
      await this.hub.markBloom(plantId);
  }

  protected async flush(plantId: string, name: string): Promise<void> {
    if (confirm(`Start the flush of ${name} today? It gets plain water from now on.`))
      await this.hub.markFlush(plantId);
  }

  protected busy(key: string): boolean {
    return this.hub.busy().has(key);
  }

  protected feedLabel(f: FeedView): string {
    const when = ago(f.finishedAt ?? f.requestedAt, this.clock.now());
    switch (f.state) {
      case 'planned':
      case 'started':
        return `Feeding now: ${f.message}`;
      case 'done':
        return `Fed ${when}${f.batchLiters ? `, ${f.batchLiters} L` : ''}`;
      case 'aborted':
        return `Last feed stopped ${when}: ${f.message}`;
      case 'refused':
        return `Last feed refused ${when}: ${f.message}`;
    }
  }

  protected async preview(pot: Pot): Promise<void> {
    this.previews.update((m) => ({ ...m, [pot.id]: 'loading' }));
    try {
      const p = await this.hub.feedPreview(pot.id);
      this.previews.update((m) => ({ ...m, [pot.id]: p }));
    } catch {
      this.previews.update((m) => {
        const { [pot.id]: _drop, ...rest } = m;
        return rest;
      });
    }
  }

  protected closePreview(pot: Pot): void {
    this.previews.update((m) => {
      const { [pot.id]: _drop, ...rest } = m;
      return rest;
    });
  }

  protected previewLines(p: FeedPreview): string[] {
    if (!p.ok) return [];
    const order = ['water', 'grow', 'micro', 'bloom', 'ripen', 'phDown'];
    return order.filter((k) => (p.ml[k] ?? 0) > 0).map((k) => `${k === 'phDown' ? 'pH down' : k}: ${p.ml[k]} mL`);
  }

  protected async feed(pot: Pot): Promise<void> {
    this.closePreview(pot);
    await this.hub.feed(pot.id);
  }

  protected amount(a: Actuator): number {
    return this.pumpAmount()[a.id] ?? (a.mlPerSecond ? 5 : 2);
  }

  protected setAmount(a: Actuator, value: string): void {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) this.pumpAmount.update((m) => ({ ...m, [a.id]: n }));
  }

  protected runPump(a: Actuator): void {
    const n = this.amount(a);
    void this.hub.run(a.id, a.mlPerSecond ? { ml: n } : { durationMs: Math.round(n * 1000) });
  }
}
