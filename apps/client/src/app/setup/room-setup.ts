import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { FormField, form, min, required, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { Room } from '@grover/contracts';
import { isPump } from '@grover/contracts/kinds';
import { Hub } from '../hub';
import { ActuatorEditor } from './actuator-editor';
import { actuatorWiring, describeRule, issueLines, probeWiring, roomDraft, slugify, toRoom, uniqueId } from './drafts';
import { EditorRun } from './editor-run';
import { FieldError } from './field-error';
import { ACTUATOR_LABELS } from './labels';
import { PotEditor } from './pot-editor';
import { ProbeEditor } from './probe-editor';
import { ScheduleEditor } from './schedule-editor';
import { SetupApi } from './setup-api';

type Editing = { kind: 'pot' | 'probe' | 'actuator' | 'schedule'; id: string | null } | null;

@Component({
  selector: 'gr-room-setup',
  imports: [FormField, FieldError, RouterLink, PotEditor, ProbeEditor, ActuatorEditor, ScheduleEditor],
  templateUrl: './room-setup.html',
  styles: `
    :host {
      display: grid;
      gap: var(--space-5);
    }
    h1 {
      margin: 0;
      font-size: 1.5rem;
    }
    section {
      display: grid;
      gap: var(--space-3);
    }
    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-3);
      h2 {
        margin: 0;
        font-size: 1.125rem;
      }
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
    }
    .empty {
      color: var(--muted);
      margin: 0;
    }
  `,
})
export class RoomSetup {
  private readonly hub = inject(Hub);
  private readonly api = inject(SetupApi);
  private readonly router = inject(Router);
  /** Route parameter; "new" for a room not saved yet. */
  readonly id = input.required<string>();

  protected readonly snapshot = this.hub.snapshot;
  protected readonly isNew = computed(() => this.id() === 'new');
  protected readonly room = computed(() => this.snapshot()?.rooms.find((r) => r.id === this.id()) ?? null);
  protected readonly calendars = computed(() => this.snapshot()?.calendars ?? []);
  protected readonly agents = computed(() => this.snapshot()?.agents ?? []);
  /** Agents not already running another room. */
  protected readonly freeAgents = computed(() => {
    const used = new Set((this.snapshot()?.rooms ?? []).filter((r) => r.id !== this.id()).map((r) => r.agentId));
    return this.agents().filter((a) => !used.has(a.agentId));
  });

  protected readonly pots = computed(() => (this.snapshot()?.pots ?? []).filter((p) => p.roomId === this.id()));
  protected readonly probes = computed(() => (this.snapshot()?.probes ?? []).filter((p) => p.roomId === this.id()));
  protected readonly actuators = computed(() =>
    (this.snapshot()?.actuators ?? []).filter((a) => a.roomId === this.id()),
  );
  protected readonly schedules = computed(() => {
    const probes = new Map(this.probes().map((p) => [p.id, p.name]));
    const actuators = new Map(this.actuators().map((a) => [a.id, a.name]));
    return (this.snapshot()?.schedules ?? [])
      .map((s) => ({
        schedule: s,
        target: s.target.type === 'probe' ? probes.get(s.target.probeId) : actuators.get(s.target.actuatorId),
        rule: describeRule(s.rule),
      }))
      .filter((row) => row.target !== undefined);
  });
  private readonly allIds = computed(() => {
    const s = this.snapshot();
    return {
      pots: s?.pots.map((p) => p.id) ?? [],
      probes: s?.probes.map((p) => p.id) ?? [],
      actuators: s?.actuators.map((a) => a.id) ?? [],
      schedules: s?.schedules.map((x) => x.id) ?? [],
      rooms: s?.rooms.map((r) => r.id) ?? [],
    };
  });
  protected readonly potIds = computed(() => this.allIds().pots);
  protected readonly probeIds = computed(() => this.allIds().probes);
  protected readonly actuatorIds = computed(() => this.allIds().actuators);
  protected readonly scheduleIds = computed(() => this.allIds().schedules);

  protected readonly probeKindTitle = (kind: keyof NonNullable<ReturnType<Hub['snapshot']>>['probeKinds']) =>
    this.snapshot()?.probeKinds[kind].title ?? kind;
  protected readonly actuatorLabels = ACTUATOR_LABELS;
  protected readonly isPump = isPump;
  protected readonly probeWiring = probeWiring;
  protected readonly actuatorWiring = actuatorWiring;

  // ── room form ────────────────────────────────────────────────────────────
  protected readonly model = linkedSignal(() => roomDraft(this.room() ?? undefined));
  protected readonly f = form(this.model, (p) => {
    required(p.name, { message: 'Give the room a name' });
    min(p.reservoirLiters, 1, { message: 'At least 1 L' });
    required(p.calendarStart, {
      message: 'Day 1 of the grow',
      when: ({ valueOf }) => valueOf(p.calendarId) !== '',
    });
  });
  protected readonly roomRun = new EditorRun();

  protected async saveRoom(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.f, async () => {
      const d = this.model();
      const id = this.isNew() ? uniqueId(slugify(d.name), this.allIds().rooms) : d.id;
      const parsed = Room.safeParse(toRoom({ ...d, id }));
      if (!parsed.success) return void this.roomRun.errors.set(issueLines(parsed.error.issues));
      await this.roomRun.run(
        () => this.api.put('rooms', parsed.data),
        () => {
          if (this.isNew()) void this.router.navigate(['/setup/rooms', id]);
        },
      );
    });
  }

  protected async deleteRoom(): Promise<void> {
    const r = this.room();
    if (
      !r ||
      !confirm(`Delete room "${r.name}" with its pots, probes, actuators and schedules? History stays in the database.`)
    )
      return;
    await this.roomRun.run(
      () => this.api.remove('rooms', r.id),
      () => void this.router.navigate(['/setup']),
    );
  }

  // ── sub-editors ──────────────────────────────────────────────────────────
  protected readonly editing = signal<Editing>(null);
  protected edit(kind: NonNullable<Editing>['kind'], id: string | null): void {
    this.editing.set({ kind, id });
  }
  protected isEditing(kind: NonNullable<Editing>['kind'], id: string | null): boolean {
    const e = this.editing();
    return !!e && e.kind === kind && e.id === id;
  }
  protected readonly editingPot = computed(() => this.find(this.pots(), 'pot'));
  protected readonly editingProbe = computed(() => this.find(this.probes(), 'probe'));
  protected readonly editingActuator = computed(() => this.find(this.actuators(), 'actuator'));
  protected readonly editingSchedule = computed(() =>
    this.find(
      this.schedules().map((r) => r.schedule),
      'schedule',
    ),
  );
  private find<T extends { id: string }>(list: readonly T[], kind: NonNullable<Editing>['kind']): T | null {
    const e = this.editing();
    return e?.kind === kind && e.id ? (list.find((x) => x.id === e.id) ?? null) : null;
  }
  protected potName(id: string | null): string {
    return id ? (this.pots().find((p) => p.id === id)?.name ?? id) : 'Reservoir';
  }
}
