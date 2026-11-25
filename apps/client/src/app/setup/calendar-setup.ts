import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { FormField, applyEach, form, max, min, required, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { Calendar, DEFAULT_CALENDAR, type Phase } from '@grover/contracts';
import { Hub } from '../hub';
import { issueLines, slugify, uniqueId } from './drafts';
import { EditorRun } from './editor-run';
import { FieldError } from './field-error';
import { SetupApi } from './setup-api';

const blankPhase = (): Phase => ({
  name: '',
  days: 14,
  blooming: false,
  flushing: false,
  lightHours: 18,
  dose: { grow: 0, micro: 0, bloom: 0, ripen: 0, phDown: 0 },
  ec: { min: 1.0, max: 1.5 },
  ph: { min: 5.5, max: 6.0 },
  waterTemp: { min: 15, max: 35 },
  waterLevel: { min: 10, max: 90 },
});

/** Edits a grow calendar: its phases, in order, with doses (mL per 10 L) and target ranges. */
@Component({
  selector: 'gr-calendar-setup',
  imports: [FormField, FieldError, RouterLink],
  templateUrl: './calendar-setup.html',
  styles: `
    :host {
      display: grid;
      gap: var(--bx-space-4);
    }
    h1 {
      margin: 0;
      font-size: 1.5rem;
    }
    .phase {
      background: var(--bx-surface-raised);
      border: 1px solid var(--bx-border);
      border-radius: var(--gr-radius-lg);
      padding: var(--bx-space-4);
      display: grid;
      gap: var(--bx-space-3);
    }
    .phase-head {
      display: flex;
      align-items: center;
      gap: var(--bx-space-2);
      h2 {
        margin: 0;
        font-size: 1rem;
        flex: 1;
      }
    }
    fieldset {
      border: 0;
      padding: 0;
      margin: 0;
      min-width: 0;
    }
    legend {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--bx-text-muted);
      margin-bottom: var(--bx-space-1);
    }
    .ranges {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
      gap: var(--bx-space-2) var(--bx-space-3);
    }
    .pair {
      display: flex;
      gap: var(--bx-space-1);
      align-items: center;
      input {
        width: 100%;
      }
    }
  `,
})
export class CalendarSetup {
  private readonly hub = inject(Hub);
  private readonly api = inject(SetupApi);
  private readonly router = inject(Router);
  readonly id = input.required<string>();

  protected readonly snapshot = this.hub.snapshot;
  protected readonly isNew = computed(() => this.id() === 'new');
  protected readonly calendar = computed(() => this.snapshot()?.calendars.find((c) => c.id === this.id()) ?? null);
  protected readonly usedBy = computed(() => (this.snapshot()?.rooms ?? []).filter((r) => r.calendarId === this.id()));

  /** A new calendar starts as a copy of the default, renamed. */
  protected readonly model = linkedSignal<Calendar>(() =>
    structuredClone(this.calendar() ?? { ...DEFAULT_CALENDAR, id: '', name: '' }),
  );
  protected readonly f = form(this.model, (c) => {
    required(c.name, { message: 'Give the calendar a name' });
    applyEach(c.phases, (p) => {
      required(p.name, { message: 'Name the phase' });
      min(p.days, 1, { message: 'At least 1 day' });
      min(p.lightHours, 0, { message: '0 to 24' });
      max(p.lightHours, 24, { message: '0 to 24' });
      for (const k of ['grow', 'micro', 'bloom', 'ripen', 'phDown'] as const)
        min(p.dose[k], 0, { message: 'Not negative' });
    });
  });
  protected readonly run = new EditorRun();
  protected readonly totalDays = computed(() => this.model().phases.reduce((n, p) => n + p.days, 0));
  protected readonly doseKeys = [
    ['grow', 'Grow'],
    ['micro', 'Micro'],
    ['bloom', 'Bloom'],
    ['ripen', 'Ripen'],
    ['phDown', 'pH down'],
  ] as const;
  protected readonly rangeKeys = [
    ['ec', 'EC (mS/cm)'],
    ['ph', 'pH'],
    ['waterTemp', 'Water °C'],
    ['waterLevel', 'Level (cm)'],
  ] as const;

  protected addPhase(): void {
    this.model.update((c) => ({ ...c, phases: [...c.phases, blankPhase()] }));
  }
  protected removePhase(i: number): void {
    this.model.update((c) => ({ ...c, phases: c.phases.filter((_, j) => j !== i) }));
  }
  protected movePhase(i: number, by: -1 | 1): void {
    this.model.update((c) => {
      const phases = [...c.phases];
      const [p] = phases.splice(i, 1);
      phases.splice(i + by, 0, p!);
      return { ...c, phases };
    });
  }

  protected async save(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.f, async () => {
      const c = this.model();
      const id = this.isNew() ? uniqueId(slugify(c.name), this.snapshot()?.calendars.map((x) => x.id) ?? []) : c.id;
      const parsed = Calendar.safeParse({ ...c, id, name: c.name.trim() });
      if (!parsed.success) return void this.run.errors.set(issueLines(parsed.error.issues));
      await this.run.run(
        () => this.api.put('calendars', parsed.data),
        () => void this.router.navigate(['/setup']),
      );
    });
  }

  protected async remove(): Promise<void> {
    const c = this.calendar();
    if (!c || !confirm(`Delete calendar "${c.name}"?`)) return;
    await this.run.run(
      () => this.api.remove('calendars', c.id),
      () => void this.router.navigate(['/setup']),
    );
  }
}
