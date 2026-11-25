import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { FormField, form, max, min, pattern, required, submit, validate } from '@angular/forms/signals';
import { Schedule, type Actuator, type Probe } from '@grover/contracts';
import { isPump } from '@grover/contracts/kinds';
import { FieldError } from './field-error';
import { WEEKDAY_NAMES, issueLines, scheduleDraft, slugify, toSchedule, uniqueId } from './drafts';
import { EditorRun } from './editor-run';
import { SetupApi } from './setup-api';

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

@Component({
  selector: 'gr-schedule-editor',
  imports: [FormField, FieldError],
  template: `
    <form class="editor" (submit)="save($event)" novalidate>
      <h3>{{ isNew() ? 'New schedule' : 'Edit schedule' }}</h3>
      <div class="form-grid">
        <label class="field">
          For
          <select [formField]="f.targetId" (change)="syncTargetType()">
            <option value="" disabled>Choose…</option>
            <optgroup label="Probes (take a reading)">
              @for (p of probes(); track p.id) {
                <option [value]="p.id">{{ p.name }}</option>
              }
            </optgroup>
            <optgroup label="Actuators">
              @for (a of actuators(); track a.id) {
                <option [value]="a.id">{{ a.name }}</option>
              }
            </optgroup>
          </select>
          <gr-field-error [state]="f.targetId()" />
        </label>
        <label class="field">
          When
          <select [formField]="f.kind">
            @if (canHold()) {
              <option value="window">Keep on between two times</option>
              <option value="dark">Keep off all day</option>
            }
            <option value="at">At set times</option>
            <option value="every">Every few minutes</option>
          </select>
          <gr-field-error [state]="f.kind()" />
        </label>
        <label class="field check"><input type="checkbox" [formField]="f.enabled" /> Enabled</label>

        @switch (model().kind) {
          @case ('window') {
            <label class="field">
              On at
              <input type="time" [formField]="f.from" />
              <gr-field-error [state]="f.from()" />
            </label>
            <label class="field">
              Off at
              <input type="time" [formField]="f.to" />
              <span class="hint">Earlier than "on" means it runs past midnight.</span>
              <gr-field-error [state]="f.to()" />
            </label>
          }
          @case ('at') {
            <label class="field">
              Times
              <input type="text" [formField]="f.times" placeholder="08:00, 20:00" />
              <gr-field-error [state]="f.times()" />
            </label>
          }
          @case ('every') {
            <label class="field">
              Every (minutes)
              <input type="number" [formField]="f.everyMinutes" />
              <gr-field-error [state]="f.everyMinutes()" />
            </label>
          }
        }
        @if (model().kind !== 'window' && model().kind !== 'dark' && model().targetType === 'actuator') {
          <label class="field">
            Run for (seconds)
            <input type="number" step="0.5" [formField]="f.durationSeconds" />
            @if (targetIsPump()) {
              <span class="hint">Capped by the pump's longest run.</span>
            }
            <gr-field-error [state]="f.durationSeconds()" />
          </label>
        }
        <fieldset class="field days">
          <legend>Days</legend>
          <div class="day-groups">
            <span class="day-group">
              @for (d of weekdays; track d) {
                <label class="day"
                  ><input type="checkbox" [checked]="model().days.includes(d)" (change)="toggleDay(d)" />{{
                    dayNames[d - 1]
                  }}</label
                >
              }
            </span>
            <span class="day-group">
              @for (d of weekend; track d) {
                <label class="day"
                  ><input type="checkbox" [checked]="model().days.includes(d)" (change)="toggleDay(d)" />{{
                    dayNames[d - 1]
                  }}</label
                >
              }
            </span>
          </div>
          <span class="day-shortcuts">
            <button type="button" class="ghost small" (click)="setDays(all)">Every day</button>
            <button type="button" class="ghost small" (click)="setDays(weekdays)">Weekdays</button>
            <button type="button" class="ghost small" (click)="setDays(weekend)">Weekend</button>
          </span>
          @if (!model().days.length) {
            <span class="form-errors" role="alert">Pick at least one day.</span>
          }
        </fieldset>
      </div>
      <p class="hint">Times are the hub's local time. A window past midnight belongs to the day it starts.</p>
      @if (errors().length) {
        <ul class="form-errors" role="alert">
          @for (e of errors(); track $index) {
            <li>{{ e }}</li>
          }
        </ul>
      }
      <div class="form-actions">
        <button type="submit" [disabled]="busy()">Save</button>
        <button type="button" class="ghost" (click)="done.emit()">Cancel</button>
        <span class="spacer"></span>
        @if (!isNew()) {
          <button type="button" class="danger" [disabled]="busy()" (click)="remove()">Delete</button>
        }
      </div>
    </form>
  `,
  styles: `
    .days {
      border: 0;
      padding: 0;
      margin: 0;
      grid-column: 1 / -1;
      legend {
        padding: 0;
      }
    }
    .day-groups {
      display: flex;
      flex-wrap: wrap;
      gap: var(--bx-space-4);
    }
    .day-group {
      display: inline-flex;
      flex-wrap: wrap;
      gap: var(--bx-space-2);
    }
    .day {
      display: inline-flex;
      align-items: center;
      gap: var(--bx-space-1);
    }
    .day-shortcuts {
      display: inline-flex;
      flex-wrap: wrap;
      gap: var(--bx-space-2);
      margin-top: var(--bx-space-2);
    }
  `,
})
export class ScheduleEditor {
  protected readonly weekdays = [1, 2, 3, 4, 5];
  protected readonly weekend = [6, 7];
  protected readonly all = [1, 2, 3, 4, 5, 6, 7];
  protected readonly dayNames = WEEKDAY_NAMES;

  protected toggleDay(d: number): void {
    this.model.update((m) => ({
      ...m,
      days: m.days.includes(d) ? m.days.filter((x) => x !== d) : [...m.days, d].sort((a, b) => a - b),
    }));
  }

  protected setDays(days: readonly number[]): void {
    this.model.update((m) => ({ ...m, days: [...days] }));
  }

  private readonly api = inject(SetupApi);
  readonly schedule = input<Schedule | null>(null);
  readonly probes = input<readonly Probe[]>([]);
  readonly actuators = input<readonly Actuator[]>([]);
  readonly takenIds = input<readonly string[]>([]);
  readonly done = output<void>();

  protected readonly isNew = computed(() => !this.schedule());
  protected readonly model = linkedSignal(() => scheduleDraft(this.schedule() ?? undefined));
  private readonly targetActuator = computed(
    () => this.actuators().find((a) => a.id === this.model().targetId) ?? null,
  );
  protected readonly targetIsPump = computed(() => {
    const a = this.targetActuator();
    return !!a && isPump(a.kind);
  });
  /** Only switches (light, fan, water loop) can be held on through a window. */
  protected readonly canHold = computed(() => {
    const a = this.targetActuator();
    return !!a && !isPump(a.kind);
  });

  protected readonly f = form(this.model, (p) => {
    required(p.targetId, { message: 'Choose what it runs' });
    validate(p.kind, ({ value, valueOf }) => {
      const a = this.actuators().find((x) => x.id === valueOf(p.targetId));
      return (value() === 'window' || value() === 'dark') && !(a && !isPump(a.kind))
        ? { kind: 'window', message: 'Only lights, fans and water loops can stay on' }
        : undefined;
    });
    pattern(p.from, HHMM, { message: 'HH:MM' });
    pattern(p.to, HHMM, { message: 'HH:MM' });
    validate(p.times, ({ value, valueOf }) => {
      if (valueOf(p.kind) !== 'at') return undefined;
      const times = value()
        .split(/[,\s]+/)
        .filter(Boolean);
      return times.length && times.every((t) => HHMM.test(t))
        ? undefined
        : { kind: 'times', message: 'One or more times like 08:00, 20:00' };
    });
    min(p.everyMinutes, 1, { message: '1 to 1440' });
    max(p.everyMinutes, 1440, { message: '1 to 1440' });
    min(p.durationSeconds, 0, { message: 'Not negative' });
  });
  protected readonly state = new EditorRun();
  protected readonly errors = this.state.errors;
  protected readonly busy = this.state.busy;

  /** The target list mixes probes and actuators; keep targetType (and a valid rule kind) in step with the choice. */
  protected syncTargetType(): void {
    const id = this.model().targetId;
    const isProbe = this.probes().some((p) => p.id === id);
    this.model.update((d) => ({
      ...d,
      targetType: isProbe ? 'probe' : 'actuator',
      kind: (d.kind === 'window' || d.kind === 'dark') && !this.canHold() ? 'every' : d.kind,
    }));
  }

  protected async save(event: Event): Promise<void> {
    event.preventDefault();
    // No day ticked: the inline message already says so; nothing to send.
    if (!this.model().days.length) return;
    await submit(this.f, async () => {
      const d = this.model();
      const id = this.isNew() ? uniqueId(slugify(`${d.targetId}-${d.kind}`), this.takenIds()) : d.id;
      const parsed = Schedule.safeParse(
        toSchedule({ ...d, id, durationSeconds: d.targetType === 'probe' ? 0 : d.durationSeconds }),
      );
      if (!parsed.success) return void this.errors.set(issueLines(parsed.error.issues));
      await this.state.run(
        () => this.api.put('schedules', parsed.data),
        () => this.done.emit(),
      );
    });
  }

  protected async remove(): Promise<void> {
    const s = this.schedule();
    if (s && confirm('Delete this schedule?'))
      await this.state.run(
        () => this.api.remove('schedules', s.id),
        () => this.done.emit(),
      );
  }
}
