import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Actuator, Alert, Probe } from '@grover/contracts';
import { TANK_PUMP, TANK_ROLES, TANK_TITLES, isPump } from '@grover/contracts/kinds';
import { Clock } from '../clock';
import { Hub } from '../hub';
import { PumpControl } from '../room/pump-control';
import { probeTile, type Tile } from '../room/tiles';

/**
 * The tent as it is plumbed and wired (F-015), drawn from its setup: supply tanks and their pumps into the mixing
 * tank, the feed pump of each pot, each pot with its loop and readings, and the tent's lights, fan and air. Live
 * state and the dashboard's controls on each part.
 */
@Component({
  selector: 'gr-rig-map',
  imports: [DecimalPipe, NgTemplateOutlet, RouterLink, PumpControl],
  templateUrl: './rig-map.html',
  styleUrl: './rig-map.scss',
})
export class RigMap {
  protected readonly hub = inject(Hub);
  private readonly clock = inject(Clock);
  readonly id = input.required<string>();

  private readonly snap = this.hub.snapshot;
  protected readonly room = computed(() => this.hub.rooms().find((r) => r.id === this.id()) ?? null);
  private readonly agent = computed(() => {
    const r = this.room();
    return r ? this.hub.agentFor(r) : null;
  });
  protected readonly online = computed(() => this.hub.connected() && !!this.agent()?.online);
  protected readonly canAct = computed(() => this.online() && this.room()?.mode === 'normal');

  private readonly probes = computed(() =>
    (this.snap()?.probes ?? []).filter((p) => p.roomId === this.id() && p.enabled),
  );
  private readonly actuators = computed(() =>
    (this.snap()?.actuators ?? []).filter((a) => a.roomId === this.id() && a.enabled),
  );
  private readonly alerts = computed(() => (this.snap()?.alerts ?? []).filter((a) => a.roomId === this.id()));
  /** The feed running in this tent, if any: one at a time. */
  protected readonly feed = computed(
    () =>
      (this.snap()?.feeds ?? []).find(
        (f) => f.roomId === this.id() && (f.state === 'planned' || f.state === 'started'),
      ) ?? null,
  );

  private tile(p: Probe, potId: string | null = null, shared = false): Tile {
    const phase = (potId ? this.snap()?.potPhases?.[potId]?.phase : null) ?? this.room()?.phase?.phase ?? null;
    return probeTile(p, {
      latest: this.hub.latest(),
      unit: this.snap()?.probeKinds[p.kind].unit ?? '',
      now: this.clock.now(),
      phase,
      shared,
    });
  }
  private probeAlerts(p: Probe): Alert[] {
    return this.alerts().filter((a) => a.key.startsWith(`probe:${p.id}:`));
  }
  private worst(alerts: readonly Alert[], low = false): 'bad' | 'warn' | null {
    return low || alerts.some((a) => a.level === 'bad') ? 'bad' : alerts.length ? 'warn' : null;
  }

  /** Lights, fans and the tent's own probes (air, and the shared pH/EC pair). */
  protected readonly tent = computed(() => ({
    switches: this.actuators().filter((a) => !isPump(a.kind) && a.potId === null),
    tiles: this.probes()
      .filter((p) => p.potId === null && p.tank === null)
      .map((p) => this.tile(p)),
  }));

  protected readonly tanks = computed(() =>
    TANK_ROLES.filter((r) => r !== 'mix').map((role) => {
      const probe = this.probes().find((p) => p.tank === role) ?? null;
      const tile = probe ? this.tile(probe) : null;
      const low = !!probe && probe.alertBelow !== null && tile?.value !== undefined && tile.value < probe.alertBelow;
      const alerts = probe ? this.probeAlerts(probe) : [];
      return {
        role,
        title: TANK_TITLES[role],
        tile,
        low,
        // One pump per supply tank is drawn; any other of the same kind is listed under "Other parts".
        pump: this.actuators().find((a) => a.kind === TANK_PUMP[role]) ?? null,
        alerts,
        worst: this.worst(alerts, low),
      };
    }),
  );

  protected readonly mix = computed(() => {
    const probe = this.probes().find((p) => p.tank === 'mix') ?? null;
    const alerts = probe ? this.probeAlerts(probe) : [];
    return { tile: probe ? this.tile(probe) : null, alerts, worst: this.worst(alerts) };
  });

  protected readonly pots = computed(() => {
    const all = this.probes();
    const shared = (kind: Probe['kind']) => all.find((p) => p.potId === null && p.tank === null && p.kind === kind);
    return (this.snap()?.pots ?? [])
      .filter((p) => p.roomId === this.id())
      .map((pot) => {
        const own = (kind: Probe['kind']) => all.find((p) => p.potId === pot.id && p.kind === kind);
        const tiles: Tile[] = [];
        for (const kind of ['water_level', 'ph', 'ec', 'water_temperature'] as const) {
          const p = own(kind) ?? (kind === 'ph' || kind === 'ec' ? shared(kind) : undefined);
          if (p) tiles.push(this.tile(p, pot.id, !own(kind)));
        }
        const plant = (this.snap()?.plants ?? []).find((p) => p.potId === pot.id && p.harvestedOn === null) ?? null;
        const phase = this.snap()?.potPhases?.[pot.id] ?? null;
        const alerts = this.alerts().filter((a) => a.potId === pot.id);
        return {
          pot,
          plant,
          // Worded as on the room card.
          phase: phase
            ? `${phase.phase.name} · day ${phase.day}${phase.source === 'plant' ? '' : ' (tent calendar)'}`
            : null,
          tiles,
          loop: this.actuators().find((a) => a.potId === pot.id && a.kind === 'water_loop') ?? null,
          feedPump: this.actuators().find((a) => a.potId === pot.id && a.kind === 'pump_transfer') ?? null,
          alerts,
          worst: this.worst(alerts),
          feeding: this.feed()?.potId === pot.id,
        };
      });
  });

  /** Switches and pumps the drawing has no place for (a second pump of a kind, a transfer pump without a pot…). */
  protected readonly others = computed(() => {
    const drawn = new Set<string>([
      ...this.tent().switches.map((a) => a.id),
      ...this.tanks().flatMap((t) => (t.pump ? [t.pump.id] : [])),
      ...this.pots().flatMap((p) => [p.loop?.id, p.feedPump?.id].filter((id): id is string => !!id)),
    ]);
    return this.actuators().filter((a) => !drawn.has(a.id));
  });

  /** The pot being fed, by name. */
  protected readonly feedingPot = computed(() => {
    const f = this.feed();
    return f ? (this.snap()?.pots.find((p) => p.id === f.potId)?.name ?? f.potId) : null;
  });

  protected readonly canRead = computed(() => this.online() && this.room()?.mode !== 'off');

  protected isPump = isPump;

  /** Alerts not drawn on a part: agent offline and anything else of the tent. */
  protected readonly tentAlerts = computed(() => {
    const onParts = new Set([
      ...this.tanks().flatMap((t) => t.alerts.map((a) => a.key)),
      ...this.mix().alerts.map((a) => a.key),
      ...this.pots().flatMap((p) => p.alerts.map((a) => a.key)),
    ]);
    return this.alerts().filter((a) => !onParts.has(a.key));
  });

  /** What the mode allows to switch on: everything in normal, lights in silent, nothing when off. Off always. */
  protected canSwitch(a: Actuator): boolean {
    if (!this.online() || this.hub.busy().has('act:' + a.id)) return false;
    if (this.hub.active().has(a.id)) return true;
    const mode = this.room()?.mode;
    return mode === 'normal' || (mode === 'silent' && a.kind === 'light');
  }

  protected toggle(a: Actuator): void {
    void this.hub.switch(a.id, !this.hub.active().has(a.id));
  }

  protected reading(t: Tile): boolean {
    return this.hub.busy().has('probe:' + t.probe.id);
  }

  protected read(t: Tile): void {
    void this.hub.read(t.probe.id);
  }

  protected feedNow(potId: string, name: string): void {
    if (confirm(`Feed ${name} now? The supply pumps fill the mixing tank, then its feed pump moves it.`))
      void this.hub.feed(potId);
  }

  /** As on the room card: at once, no question (it is the emergency stop). */
  protected stopAll(): void {
    const r = this.room();
    if (r) void this.hub.stop(r.id);
  }
}
