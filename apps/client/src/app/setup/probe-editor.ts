import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { FormField, form, max, min, pattern, required, submit } from '@angular/forms/signals';
import { Probe, type Pot } from '@grover/contracts';
import { FieldError } from './field-error';
import { issueLines, probeDraft, slugify, toProbe, uniqueId } from './drafts';
import { PROBE_DRIVERS, probeKinds } from './labels';
import { EditorRun } from './editor-run';
import { SetupApi } from './setup-api';

@Component({
  selector: 'gr-probe-editor',
  imports: [FormField, FieldError],
  template: `
    <form class="editor" (submit)="save($event)" novalidate>
      <h3>{{ isNew() ? 'New probe' : 'Edit probe: ' + probe()!.name }}</h3>
      <div class="form-grid">
        <label class="field">
          Name
          <input type="text" [formField]="f.name" />
          <gr-field-error [state]="f.name()" />
        </label>
        <label class="field">
          Measures
          <select [formField]="f.kind">
            @for (k of kinds; track k.id) {
              <option [value]="k.id">{{ k.label }} ({{ k.unit }})</option>
            }
          </select>
        </label>
        <label class="field">
          Where
          <select [formField]="f.potId">
            <option value="">Reservoir (whole room)</option>
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
        @switch (model().driver) {
          @case ('ds18b20') {
            <label class="field">
              1-Wire address
              <input type="text" [formField]="f.address" placeholder="28-0123456789ab" />
              <span class="hint">The folder name in /sys/bus/w1/devices on the Pi.</span>
              <gr-field-error [state]="f.address()" />
            </label>
          }
          @case ('ads1115') {
            <label class="field">
              I²C bus
              <input type="number" [formField]="f.i2cBus" />
            </label>
            <label class="field">
              I²C address
              <input type="text" [formField]="f.i2cAddress" />
              <gr-field-error [state]="f.i2cAddress()" />
            </label>
            <label class="field">
              Channel (0–3)
              <input type="number" [formField]="f.channel" />
              <gr-field-error [state]="f.channel()" />
            </label>
            <p class="hint field wide">Analog probes report volts until calibration exists (backlog F-004).</p>
          }
          @case ('hcsr04') {
            <p class="hint field wide">The agent refuses this sensor: Node cannot time its echo. Use an analog or I²C level sensor.</p>
          }
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
export class ProbeEditor {
  private readonly api = inject(SetupApi);
  readonly roomId = input.required<string>();
  /** null: a new probe */
  readonly probe = input<Probe | null>(null);
  readonly pots = input<readonly Pot[]>([]);
  readonly takenIds = input<readonly string[]>([]);
  readonly done = output<void>();

  protected readonly kinds = probeKinds;
  protected readonly drivers = PROBE_DRIVERS;
  protected readonly isNew = computed(() => !this.probe());
  protected readonly model = linkedSignal(() => probeDraft(this.probe() ?? undefined));
  protected readonly f = form(this.model, (p) => {
    required(p.name, { message: 'Give it a name' });
    required(p.address, {
      message: 'The 1-Wire address is needed',
      when: ({ valueOf }) => valueOf(p.driver) === 'ds18b20',
    });
    pattern(p.i2cAddress, /^(0x[0-9a-fA-F]{1,2}|\d{1,3})$/, { message: 'Like 0x48' });
    min(p.i2cBus, 0, { message: 'Bus 0 or more' });
    min(p.channel, 0, { message: '0 to 3' });
    max(p.channel, 3, { message: '0 to 3' });
  });
  protected readonly newId = computed(() => uniqueId(slugify(this.model().name), this.takenIds()));
  protected readonly state = new EditorRun();
  protected readonly errors = this.state.errors;
  protected readonly busy = this.state.busy;

  protected async save(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.f, async () => {
      const draft = { ...this.model(), id: this.isNew() ? this.newId() : this.model().id };
      const parsed = Probe.safeParse(toProbe(draft, this.roomId()));
      if (!parsed.success) return void this.errors.set(issueLines(parsed.error.issues));
      await this.state.run(
        () => this.api.put('probes', parsed.data),
        () => this.done.emit(),
      );
    });
  }

  protected async remove(): Promise<void> {
    const p = this.probe();
    if (p && confirm(`Delete probe "${p.name}"? Its schedules are deleted too.`))
      await this.state.run(
        () => this.api.remove('probes', p.id),
        () => this.done.emit(),
      );
  }
}
