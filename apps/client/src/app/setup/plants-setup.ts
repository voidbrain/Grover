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
    .show {
      display: flex;
      gap: var(--space-2);
      align-items: center;
      font-size: 0.875rem;
    }
  `,
})
export class PlantsSetup {
  private readonly hub = inject(Hub);
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

  protected readonly plantRows = computed(() =>
    this.plants()
      .filter((p) => this.showHarvested() || p.harvestedOn === null)
      .map((p) => ({
        plant: p,
        strain: p.strainId ? (this.names().strain.get(p.strainId) ?? p.strainId) : '—',
        breeder: p.breederId ? (this.names().breeder.get(p.breederId) ?? p.breederId) : '—',
        origin: generationLabel(p.generation),
        mother: p.motherId ? (this.names().plant.get(p.motherId) ?? p.motherId) : null,
        pot: p.potId ? (this.names().pot.get(p.potId) ?? p.potId) : null,
      })),
  );
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
