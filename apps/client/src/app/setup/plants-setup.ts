import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { generationLabel, geneticsLabel } from '@grover/contracts/kinds';
import { Hub } from '../hub';
import { BreederEditor, PlantEditor, StrainEditor } from './plant-editors';

type Editing = { kind: 'breeder' | 'strain' | 'plant'; id: string | null } | null;

/** What grows: plants (origin, generation, pot, dates), strains (ancestry, genetics) and breeders. */
@Component({
  selector: 'gr-plants-setup',
  imports: [RouterLink, BreederEditor, StrainEditor, PlantEditor],
  templateUrl: './plants-setup.html',
  styles: `
    :host {
      display: grid;
      gap: var(--space-6);
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
      h2 {
        margin: 0;
        font-size: 1.125rem;
      }
    }
    .muted,
    .empty {
      color: var(--muted);
      font-size: 0.8125rem;
      margin: 0;
    }
    h3 {
      margin: var(--space-2) 0 0;
      font-size: 0.8125rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
    }
    .inline-select {
      width: auto;
      min-height: 1.75rem;
      font-size: 0.75rem;
    }
    .show {
      display: flex;
      gap: var(--space-2);
      align-items: center;
      font-size: 0.875rem;
    }
  `,
})
export class PlantsSetup {
  protected readonly hub = inject(Hub);
  protected readonly snapshot = this.hub.snapshot;
  protected readonly breeders = computed(() => this.snapshot()?.breeders ?? []);
  protected readonly strains = computed(() => this.snapshot()?.strains ?? []);
  protected readonly plants = computed(() => this.snapshot()?.plants ?? []);
  protected readonly pots = computed(() => this.snapshot()?.pots ?? []);
  protected readonly showHarvested = signal(false);

  private readonly names = computed(() => ({
    breeder: new Map(this.breeders().map((b) => [b.id, b.name])),
    strain: new Map(this.strains().map((s) => [s.id, s.name])),
    plant: new Map(this.plants().map((p) => [p.id, p.name])),
    pot: new Map(this.pots().map((p) => [p.id, p.name])),
  }));

  private readonly today = Date.now();
  protected readonly plantRows = computed(() =>
    this.plants()
      .filter((p) => this.showHarvested() || p.harvestedOn === null)
      .map((p) => ({
        where: p.harvestedOn ? ('harvested' as const) : p.potId ? ('tent' as const) : ('elsewhere' as const),
        age: p.startedOn
          ? Math.max(0, Math.floor((this.today - Date.parse(`${p.startedOn}T00:00:00Z`)) / 86_400_000))
          : null,
        plant: p,
        strain: p.strainId ? (this.names().strain.get(p.strainId) ?? p.strainId) : '—',
        breeder: p.breederId ? (this.names().breeder.get(p.breederId) ?? p.breederId) : '—',
        origin: generationLabel(p.generation),
        mother: p.motherId ? (this.names().plant.get(p.motherId) ?? p.motherId) : null,
        pot: p.potId ? (this.names().pot.get(p.potId) ?? p.potId) : null,
      })),
  );
  protected readonly inTent = computed(() => this.plantRows().filter((r) => r.where === 'tent'));
  protected readonly elsewhere = computed(() => this.plantRows().filter((r) => r.where === 'elsewhere'));
  protected readonly harvested = computed(() => this.plantRows().filter((r) => r.where === 'harvested'));
  /** Pots with no growing plant. */
  protected readonly freePots = computed(() =>
    this.pots().filter((pot) => !this.plants().some((p) => p.potId === pot.id && p.harvestedOn === null)),
  );
  protected readonly placeChoice = signal<Record<string, string>>({});

  protected async cuttings(plantId: string, name: string): Promise<void> {
    const answer = prompt(`How many cuttings from ${name}?`, '4');
    const count = Number(answer);
    if (answer === null || !Number.isInteger(count) || count < 1 || count > 20) return;
    await this.hub.takeCuttings(plantId, count);
  }
  protected async harvest(plantId: string, name: string): Promise<void> {
    if (confirm(`Record ${name} as harvested today? Its pot becomes free.`)) await this.hub.harvest(plantId);
  }
  protected async place(plantId: string): Promise<void> {
    const potId = this.placeChoice()[plantId] ?? this.freePots()[0]?.id;
    if (potId) await this.hub.place(potId, plantId);
  }
  protected choosePot(plantId: string, potId: string): void {
    this.placeChoice.update((m) => ({ ...m, [plantId]: potId }));
  }
  protected busy(key: string): boolean {
    return this.hub.busy().has(key);
  }

  protected readonly harvestedCount = computed(() => this.plants().filter((p) => p.harvestedOn !== null).length);

  protected readonly strainRows = computed(() =>
    this.strains().map((s) => ({
      strain: s,
      breeder: s.breederId ? (this.names().breeder.get(s.breederId) ?? s.breederId) : '—',
      parents: s.parentIds.map((id) => this.names().strain.get(id) ?? id).join(' × ') || '—',
      genetics: geneticsLabel(s.sativaPercent) ?? '—',
    })),
  );

  protected readonly editing = signal<Editing>(null);
  protected edit(kind: NonNullable<Editing>['kind'], id: string | null): void {
    this.editing.set({ kind, id });
  }
  protected isEditing(kind: NonNullable<Editing>['kind'], id: string | null): boolean {
    const e = this.editing();
    return !!e && e.kind === kind && e.id === id;
  }
  protected readonly editingBreeder = computed(() => this.pick(this.breeders(), 'breeder'));
  protected readonly editingStrain = computed(() => this.pick(this.strains(), 'strain'));
  protected readonly editingPlant = computed(() => this.pick(this.plants(), 'plant'));
  private pick<T extends { id: string }>(list: readonly T[], kind: NonNullable<Editing>['kind']): T | null {
    const e = this.editing();
    return e?.kind === kind && e.id ? (list.find((x) => x.id === e.id) ?? null) : null;
  }
  protected readonly breederIds = computed(() => this.breeders().map((b) => b.id));
}
