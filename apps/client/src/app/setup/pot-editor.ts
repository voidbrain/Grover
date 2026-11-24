import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { FormField, form, required, submit } from '@angular/forms/signals';
import { Pot } from '@grover/contracts';
import { FieldError } from './field-error';
import { issueLines, potDraft, slugify, toPot, uniqueId } from './drafts';
import { EditorRun } from './editor-run';
import { SetupApi } from './setup-api';

@Component({
  selector: 'gr-pot-editor',
  imports: [FormField, FieldError],
  template: `
    <form class="editor" (submit)="save($event)" novalidate>
      <h3>{{ isNew() ? 'New pot' : 'Edit pot: ' + pot()!.name }}</h3>
      <div class="form-grid">
        <label class="field">
          Name
          <input type="text" [formField]="f.name" />
          <gr-field-error [state]="f.name()" />
        </label>
      </div>
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
export class PotEditor {
  private readonly api = inject(SetupApi);
  readonly roomId = input.required<string>();
  readonly pot = input<Pot | null>(null);
  readonly takenIds = input<readonly string[]>([]);
  readonly done = output<void>();

  protected readonly isNew = computed(() => !this.pot());
  protected readonly model = linkedSignal(() => potDraft(this.pot() ?? undefined));
  protected readonly f = form(this.model, (p) => required(p.name, { message: 'Give it a name' }));
  protected readonly state = new EditorRun();
  protected readonly errors = this.state.errors;
  protected readonly busy = this.state.busy;

  protected async save(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.f, async () => {
      const id = this.isNew() ? uniqueId(slugify(this.model().name), this.takenIds()) : this.model().id;
      const parsed = Pot.safeParse(toPot({ ...this.model(), id }, this.roomId()));
      if (!parsed.success) return void this.errors.set(issueLines(parsed.error.issues));
      await this.state.run(
        () => this.api.put('pots', parsed.data),
        () => this.done.emit(),
      );
    });
  }

  protected async remove(): Promise<void> {
    const p = this.pot();
    if (p && confirm(`Delete pot "${p.name}"? Its probes and actuators move to the reservoir.`))
      await this.state.run(
        () => this.api.remove('pots', p.id),
        () => this.done.emit(),
      );
  }
}
