import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Actuator, DoseSuggestion, OperatingMode } from '@grover/contracts';
import { isPump } from '@grover/contracts/kinds';
import { Clock } from '../clock';
import { ago, health, targetRange } from '../format';
import { Hub, type Snapshot } from '../hub';

type RoomView = Snapshot['rooms'][number];

@Component({
  selector: 'gr-room-card',
  imports: [DecimalPipe, RouterLink],
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

  protected readonly probes = computed(() => {
    const snap = this.hub.snapshot();
    const latest = this.hub.latest();
    const now = this.clock.now();
    return (snap?.probes ?? [])
      .filter((p) => p.roomId === this.room().id && p.enabled)
      .map((p) => {
        const r = latest.get(p.id);
        const range = targetRange(p.kind, this.phase());
        return {
          probe: p,
          unit: snap?.probeKinds[p.kind].unit ?? '',
          value: r?.value,
          range,
          health: health(r?.value, range, r?.at, now),
          ago: ago(r?.at, now),
        };
      });
  });

  protected readonly switches = computed(() => this.actuators().filter((a) => !isPump(a.kind)));
  protected readonly pumps = computed(() => this.actuators().filter((a) => isPump(a.kind)));
  private readonly actuators = computed(() =>
    (this.hub.snapshot()?.actuators ?? []).filter((a) => a.roomId === this.room().id && a.enabled),
  );

  protected readonly agentLabel = computed(() => {
    const a = this.agent();
    if (!this.hub.connected()) return 'Hub unreachable: showing the last known data';
    if (!a) return 'No agent assigned';
    if (!a.online) return `Agent ${a.agentId} offline, last seen ${ago(a.lastSeen, this.clock.now())}`;
    return a.configCurrent ? `Agent ${a.agentId} online` : `Agent ${a.agentId} online, applying new settings`;
  });

  protected readonly pumpAmount = signal<Record<string, number>>({});
  protected readonly suggestion = signal<DoseSuggestion | null>(null);
  protected readonly suggestionKeys = computed(() => Object.entries(this.suggestion()?.ml ?? {}) as [string, number][]);

  protected busy(key: string): boolean {
    return this.hub.busy().has(key);
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

  protected async loadSuggestion(): Promise<void> {
    try {
      this.suggestion.set(await this.hub.suggestion(this.room().id));
    } catch {
      this.suggestion.set(null);
    }
  }

  protected async applyDose(): Promise<void> {
    await this.hub.applyDose(this.room().id);
    this.suggestion.set(null);
  }
}
