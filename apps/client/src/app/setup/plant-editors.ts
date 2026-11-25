import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { FormField, form, max, min, pattern, required, submit } from '@angular/forms/signals';
import { Breeder, Plant, Strain, type Pot } from '@grover/contracts';
import { generationLabel } from '@grover/contracts/kinds';
import { NUMBER_TEXT, issueLines, slugify, uniqueId } from './drafts';
import { EditorRun } from './editor-run';
import { FieldError } from './field-error';
import { breederDraft, plantDraft, strainDraft, toBreeder, toPlant, toStrain } from './plant-drafts';
import { SetupApi } from './setup-api';

@Component({
  selector: 'gr-breeder-editor',
  imports: [FormField, FieldError],
  template: `
    <form class="editor" (submit)="save($event)" novalidate>
      <h3>{{ isNew() ? 'New breeder' : 'Edit breeder: ' + breeder()!.name }}</h3>
      <div class="form-grid">
        <label class="field">
          Name
          <input type="text" [formField]="f.name" />
          <gr-field-error [state]="f.name()" />
        </label>
        <label class="field">
          Website
          <input type="text" inputmode="url" [formField]="f.website" placeholder="https://" />
        </label>
        <label class="field wide">
          Notes
          <input type="text" [formField]="f.notes" />
        </label>
      </div>
      @if (run.errors().length) {
        <ul class="form-errors" role="alert">
          @for (e of run.errors(); track $index) {
            <li>{{ e }}</li>
          }
        </ul>
      }
      <div class="form-actions">
        <button type="submit" [disabled]="run.busy()">Save</button>
        <button type="button" class="ghost" (click)="done.emit()">Cancel</button>
        <span class="spacer"></span>
        @if (!isNew()) {
          <button type="button" class="danger" [disabled]="run.busy()" (click)="remove()">Delete breeder</button>
        }
      </div>
    </form>
  `,
})
export class BreederEditor {
  private readonly api = inject(SetupApi);
  readonly breeder = input<Breeder | null>(null);
  readonly takenIds = input<readonly string[]>([]);
  readonly done = output<void>();
  protected readonly isNew = computed(() => !this.breeder());
  protected readonly model = linkedSignal(() => breederDraft(this.breeder() ?? undefined));
  protected readonly f = form(this.model, (p) => required(p.name, { message: 'Give it a name' }));
  protected readonly run = new EditorRun();

  protected async save(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.f, async () => {
      const id = this.isNew() ? uniqueId(slugify(this.model().name), this.takenIds()) : this.model().id;
      const parsed = Breeder.safeParse(toBreeder({ ...this.model(), id }));
      if (!parsed.success) return void this.run.errors.set(issueLines(parsed.error.issues));
      await this.run.run(
        () => this.api.put('breeders', parsed.data),
        () => this.done.emit(),
      );
    });
  }
  protected async remove(): Promise<void> {
    const b = this.breeder();
    if (b && confirm(`Delete breeder "${b.name}"?`))
      await this.run.run(
        () => this.api.remove('breeders', b.id),
        () => this.done.emit(),
      );
  }
}

@Component({
  selector: 'gr-strain-editor',
  imports: [FormField, FieldError],
  template: `
    <form class="editor" (submit)="save($event)" novalidate>
      <h3>{{ isNew() ? 'New strain' : 'Edit strain: ' + strain()!.name }}</h3>
      <div class="form-grid">
        <label class="field">
          Name
          <input type="text" [formField]="f.name" />
          <gr-field-error [state]="f.name()" />
        </label>
        <label class="field">
          Breeder
          <select [formField]="f.breederId">
            <option value="">Unknown</option>
            @for (b of breeders(); track b.id) {
              <option [value]="b.id">{{ b.name }}</option>
            }
          </select>
        </label>
        <label class="field">
          Sativa %
          <input type="text" inputmode="decimal" [formField]="f.sativaPercent" />
          <span class="hint">{{ indica() }}</span>
          <gr-field-error [state]="f.sativaPercent()" />
        </label>
        <label class="field">
          THC %
          <input type="text" inputmode="decimal" [formField]="f.thcPercent" />
          <gr-field-error [state]="f.thcPercent()" />
        </label>
        <label class="field">
          CBD %
          <input type="text" inputmode="decimal" [formField]="f.cbdPercent" />
          <gr-field-error [state]="f.cbdPercent()" />
        </label>
        <label class="field">
          Flowering (days)
          <input type="text" inputmode="numeric" [formField]="f.floweringDays" />
          <gr-field-error [state]="f.floweringDays()" />
        </label>
        <label class="field check"><input type="checkbox" [formField]="f.autoflower" /> Autoflowering</label>
        <fieldset class="field wide parents">
          <legend>Bred from (ancestry)</legend>
          @for (s of otherStrains(); track s.id) {
            <label class="check-inline">
              <input type="checkbox" [checked]="model().parentIds.includes(s.id)" (change)="toggleParent(s.id, $any($event.target).checked)" />
              {{ s.name }}
            </label>
          } @empty {
            <span class="hint">Add the parent strains first.</span>
          }
        </fieldset>
        <label class="field wide">
          Notes (where the numbers come from)
          <input type="text" [formField]="f.notes" />
        </label>
      </div>
      @if (run.errors().length) {
        <ul class="form-errors" role="alert">
          @for (e of run.errors(); track $index) {
            <li>{{ e }}</li>
          }
        </ul>
      }
      <div class="form-actions">
        <button type="submit" [disabled]="run.busy()">Save</button>
        <button type="button" class="ghost" (click)="done.emit()">Cancel</button>
        <span class="spacer"></span>
        @if (!isNew()) {
          <button type="button" class="danger" [disabled]="run.busy()" (click)="remove()">Delete strain</button>
        }
      </div>
    </form>
  `,
  styles: `
    .parents {
      border: 0;
      padding: 0;
      margin: 0;
      display: flex;
      flex-wrap: wrap;
      gap: var(--bx-space-1) var(--bx-space-3);
      legend {
        width: 100%;
        margin-bottom: var(--bx-space-1);
      }
    }
    .check-inline {
      display: inline-flex;
      gap: var(--bx-space-1);
      align-items: center;
      color: var(--bx-text);
      font-size: 0.875rem;
    }
  `,
})
export class StrainEditor {
  private readonly api = inject(SetupApi);
  readonly strain = input<Strain | null>(null);
  readonly strains = input<readonly Strain[]>([]);
  readonly breeders = input<readonly Breeder[]>([]);
  readonly done = output<void>();
  protected readonly isNew = computed(() => !this.strain());
  protected readonly model = linkedSignal(() => strainDraft(this.strain() ?? undefined));
  protected readonly otherStrains = computed(() => this.strains().filter((s) => s.id !== this.strain()?.id));
  protected readonly indica = computed(() => {
    const n = Number(this.model().sativaPercent);
    return this.model().sativaPercent.trim() !== '' && n >= 0 && n <= 100
      ? `${100 - n} % indica`
      : 'Indica is the rest.';
  });
  protected readonly f = form(this.model, (p) => {
    required(p.name, { message: 'Give it a name' });
    for (const k of [p.sativaPercent, p.thcPercent, p.cbdPercent, p.floweringDays])
      pattern(k, NUMBER_TEXT, { message: 'A number, or empty' });
  });
  protected readonly run = new EditorRun();

  protected toggleParent(id: string, on: boolean): void {
    this.model.update((d) => ({
      ...d,
      parentIds: on ? [...new Set([...d.parentIds, id])] : d.parentIds.filter((p) => p !== id),
    }));
  }

  protected async save(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.f, async () => {
      const id = this.isNew()
        ? uniqueId(
            slugify(this.model().name),
            this.strains().map((s) => s.id),
          )
        : this.model().id;
      const parsed = Strain.safeParse(toStrain({ ...this.model(), id }));
      if (!parsed.success) return void this.run.errors.set(issueLines(parsed.error.issues));
      await this.run.run(
        () => this.api.put('strains', parsed.data),
        () => this.done.emit(),
      );
    });
  }
  protected async remove(): Promise<void> {
    const s = this.strain();
    if (s && confirm(`Delete strain "${s.name}"?`))
      await this.run.run(
        () => this.api.remove('strains', s.id),
        () => this.done.emit(),
      );
  }
}

@Component({
  selector: 'gr-plant-editor',
  imports: [FormField, FieldError],
  template: `
    <form class="editor" (submit)="save($event)" novalidate>
      <h3>{{ isNew() ? 'New plant' : 'Edit plant: ' + plant()!.name }}</h3>
      <div class="form-grid">
        <label class="field">
          Name
          <input type="text" [formField]="f.name" />
          <gr-field-error [state]="f.name()" />
        </label>
        <label class="field">
          Strain
          <select [formField]="f.strainId" (change)="strainChosen()">
            <option value="">Unknown</option>
            @for (s of strains(); track s.id) {
              <option [value]="s.id">{{ s.name }}</option>
            }
          </select>
        </label>
        <label class="field">
          Seed from (breeder)
          <select [formField]="f.breederId">
            <option value="">Unknown</option>
            @for (b of breeders(); track b.id) {
              <option [value]="b.id">{{ b.name }}</option>
            }
          </select>
        </label>
        <label class="field">
          Generation
          <input type="number" [formField]="f.generation" />
          <span class="hint">{{ genLabel() }}</span>
          <gr-field-error [state]="f.generation()" />
        </label>
        @if (model().generation > 0) {
          <label class="field">
            Cut from (mother plant)
            <select [formField]="f.motherId">
              <option value="">Not recorded</option>
              @for (m of mothers(); track m.id) {
                <option [value]="m.id">{{ m.name }} ({{ label(m.generation) }})</option>
              }
            </select>
          </label>
        }
        <label class="field">
          Pot
          <select [formField]="f.potId">
            <option value="">Not in a pot</option>
            @for (p of pots(); track p.id) {
              <option [value]="p.id">{{ p.name }}</option>
            }
          </select>
        </label>
        <label class="field">
          Medium
          <select [formField]="f.medium">
            <option value="">Unknown</option>
            <option value="hydro">Hydro</option>
            <option value="coco">Coco</option>
            <option value="soil">Soil</option>
          </select>
        </label>
        <label class="field">Started <input type="date" [formField]="f.startedOn" /></label>
        <label class="field">Into the tent <input type="date" [formField]="f.placedOn" /></label>
        <label class="field">Trimmed <input type="date" [formField]="f.trimmedOn" /></label>
        <label class="field">Bloom from <input type="date" [formField]="f.bloomOn" /></label>
        <label class="field">Flush from <input type="date" [formField]="f.flushOn" /></label>
        <label class="field">Harvested <input type="date" [formField]="f.harvestedOn" /></label>
        <label class="field">
          Yield (g)
          <input type="text" inputmode="decimal" [formField]="f.yieldGrams" />
          <gr-field-error [state]="f.yieldGrams()" />
        </label>
        <label class="field wide">
          Notes
          <input type="text" [formField]="f.notes" />
        </label>
      </div>
      @if (run.errors().length) {
        <ul class="form-errors" role="alert">
          @for (e of run.errors(); track $index) {
            <li>{{ e }}</li>
          }
        </ul>
      }
      <div class="form-actions">
        <button type="submit" [disabled]="run.busy()">Save</button>
        <button type="button" class="ghost" (click)="done.emit()">Cancel</button>
        <span class="spacer"></span>
        @if (!isNew()) {
          <button type="button" class="danger" [disabled]="run.busy()" (click)="remove()">Delete plant</button>
        }
      </div>
    </form>
  `,
})
export class PlantEditor {
  private readonly api = inject(SetupApi);
  readonly plant = input<Plant | null>(null);
  readonly plants = input<readonly Plant[]>([]);
  readonly strains = input<readonly Strain[]>([]);
  readonly breeders = input<readonly Breeder[]>([]);
  readonly pots = input<readonly Pot[]>([]);
  readonly done = output<void>();
  protected readonly isNew = computed(() => !this.plant());
  protected readonly model = linkedSignal(() => plantDraft(this.plant() ?? undefined));
  /** Mothers: plants of the same strain (any when the strain is unknown), never the plant itself. */
  protected readonly mothers = computed(() =>
    this.plants().filter(
      (p) => p.id !== this.plant()?.id && (!this.model().strainId || p.strainId === this.model().strainId),
    ),
  );
  protected readonly genLabel = computed(() => generationLabel(Math.max(0, Math.round(this.model().generation || 0))));
  protected readonly label = generationLabel;
  protected readonly f = form(this.model, (p) => {
    required(p.name, { message: 'Give it a name' });
    min(p.generation, 0, { message: '0 (from seed) or more' });
    max(p.generation, 99, { message: 'At most 99' });
    pattern(p.yieldGrams, NUMBER_TEXT, { message: 'A number, or empty' });
  });
  protected readonly run = new EditorRun();

  /** A new plant takes its strain's breeder unless one is chosen. */
  protected strainChosen(): void {
    const strain = this.strains().find((s) => s.id === this.model().strainId);
    if (strain?.breederId && !this.model().breederId)
      this.model.update((d) => ({ ...d, breederId: strain.breederId! }));
  }

  protected async save(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.f, async () => {
      const id = this.isNew()
        ? uniqueId(
            slugify(this.model().name),
            this.plants().map((p) => p.id),
          )
        : this.model().id;
      const parsed = Plant.safeParse(toPlant({ ...this.model(), id }));
      if (!parsed.success) return void this.run.errors.set(issueLines(parsed.error.issues));
      await this.run.run(
        () => this.api.put('plants', parsed.data),
        () => this.done.emit(),
      );
    });
  }
  protected async remove(): Promise<void> {
    const p = this.plant();
    if (p && confirm(`Delete plant "${p.name}"? Cuttings taken from it keep their record, without a mother.`))
      await this.run.run(
        () => this.api.remove('plants', p.id),
        () => this.done.emit(),
      );
  }
}
