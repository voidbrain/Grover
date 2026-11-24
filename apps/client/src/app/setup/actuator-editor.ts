import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { FormField, form, max, min, pattern, required, submit } from '@angular/forms/signals';
import { Actuator, type Pot } from '@grover/contracts';
import { isPump } from '@grover/contracts/kinds';
import { FieldError } from './field-error';
import { actuatorDraft, issueLines, slugify, toActuator, uniqueId } from './drafts';
import { EditorRun } from './editor-run';
import { ACTUATOR_DRIVERS, actuatorKinds } from './labels';
import { SetupApi } from './setup-api';

@Component({
  selector: 'gr-actuator-editor',
  imports: [FormField, FieldError],
  template: `
    <form class="editor" (submit)="save($event)" novalidate>
      <h3>{{ isNew() ? 'New actuator' : 'Edit actuator: ' + actuator()!.name }}</h3>
      <div class="form-grid">
        <label class="field">
          Name
          <input type="text" [formField]="f.name" />
          <gr-field-error [state]="f.name()" />
        </label>
        <label class="field">
          Kind
          <select [formField]="f.kind">
            @for (k of kinds; track k.id) {
              <option [value]="k.id">{{ k.label }}</option>
            }
          </select>
        </label>
        <label class="field">
          Where
          <select [formField]="f.potId">
            <option value="">The tent (supply pumps, lights, fans)</option>
            @for (p of pots(); track p.id) {
              <option [value]="p.id">{{ p.name }}</option>
            }
          </select>
        </label>
        <label class="field check"><input type="checkbox" [formField]="f.enabled" /> Enabled</label>

        <label class="field">
          Wiring
          <select [formField]="f.driver">
            @for (d of drivers; track d.id) {
              <option [value]="d.id">{{ d.label }}</option>
            }
          </select>
        </label>
        @if (model().driver === 'mcp23017') {
          <label class="field">
            I²C bus
            <input type="number" [formField]="f.i2cBus" />
          </label>
          <label class="field">
            I²C address
            <input type="text" [formField]="f.i2cAddress" />
            <gr-field-error [state]="f.i2cAddress()" />
          </label>
        }
        @if (model().driver !== 'mock') {
          <label class="field">
            {{ model().driver === 'gpio' ? 'GPIO pin (BCM)' : 'Expander pin (0–15)' }}
            <input type="number" [formField]="f.pin" />
            <gr-field-error [state]="f.pin()" />
          </label>
          <label class="field check"><input type="checkbox" [formField]="f.activeLow" /> Active low (relay on when the pin is low)</label>
        }

        @if (pump()) {
          <label class="field">
            Longest run (seconds)
            <input type="number" step="1" [formField]="f.maxRunSeconds" />
            <span class="hint">The agent never runs this pump longer, whatever it is asked.</span>
            <gr-field-error [state]="f.maxRunSeconds()" />
          </label>
          <label class="field">
            Flow (mL per second)
            <input type="number" step="0.01" [formField]="f.mlPerSecond" />
            <span class="hint">0 = not calibrated: runs by time only, no dosing by volume.</span>
            <gr-field-error [state]="f.mlPerSecond()" />
          </label>
        }
      </div>
      @if (isNew() && model().name) {
        <p class="hint">Id: {{ newId() }}</p>
      }
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
})
export class ActuatorEditor {
  private readonly api = inject(SetupApi);
  readonly roomId = input.required<string>();
  readonly actuator = input<Actuator | null>(null);
  readonly pots = input<readonly Pot[]>([]);
  readonly takenIds = input<readonly string[]>([]);
  readonly done = output<void>();

  protected readonly kinds = actuatorKinds;
  protected readonly drivers = ACTUATOR_DRIVERS;
  protected readonly isNew = computed(() => !this.actuator());
  protected readonly model = linkedSignal(() => actuatorDraft(this.actuator() ?? undefined));
  protected readonly pump = computed(() => isPump(this.model().kind));
  protected readonly f = form(this.model, (p) => {
    required(p.name, { message: 'Give it a name' });
    pattern(p.i2cAddress, /^(0x[0-9a-fA-F]{1,2}|\d{1,3})$/, { message: 'Like 0x20' });
    min(p.i2cBus, 0, { message: 'Bus 0 or more' });
    min(p.pin, 0, { message: 'A pin number' });
    max(p.pin, 40, { message: 'A pin number' });
    min(p.maxRunSeconds, 1, { message: 'At least 1 second' });
    max(p.maxRunSeconds, 600, { message: 'At most 600 seconds' });
    min(p.mlPerSecond, 0, { message: 'Not negative' });
  });
  protected readonly newId = computed(() => uniqueId(slugify(this.model().name), this.takenIds()));
  protected readonly state = new EditorRun();
  protected readonly errors = this.state.errors;
  protected readonly busy = this.state.busy;

  protected async save(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.f, async () => {
      const draft = { ...this.model(), id: this.isNew() ? this.newId() : this.model().id };
      const parsed = Actuator.safeParse(toActuator(draft, this.roomId(), this.pump()));
      if (!parsed.success) return void this.errors.set(issueLines(parsed.error.issues));
      await this.state.run(
        () => this.api.put('actuators', parsed.data),
        () => this.done.emit(),
      );
    });
  }

  protected async remove(): Promise<void> {
    const a = this.actuator();
    if (a && confirm(`Delete "${a.name}"? Its schedules are deleted too.`))
      await this.state.run(
        () => this.api.remove('actuators', a.id),
        () => this.done.emit(),
      );
  }
}
