import { GENERATION_WARNING, type Plant } from '@grover/contracts';
import { slugify } from '@grover/contracts/kinds';
import { BadReference, NotFound, type Store } from './store.ts';

/**
 * The owner's plant cycle (F-013): plants start elsewhere (no pot), are placed in a free pot, cuttings are taken
 * from a plant in the tent (they start elsewhere as the next generation), and a harvest frees the pot.
 */
export class PlantCycle {
  private readonly store: Store;
  private readonly today: () => string;
  constructor(store: Store, today: () => string = () => new Date().toISOString().slice(0, 10)) {
    this.store = store;
    this.today = today;
  }

  private plant(id: string): Plant {
    const p = this.store.listPlants().find((x) => x.id === id);
    if (!p) throw new NotFound(`plant ${id}`);
    return p;
  }

  /** N new plants of the next generation, cut from `motherId`: same strain and breeder, no pot, started today. */
  takeCuttings(motherId: string, count: number): { plants: Plant[]; warning: string | null } {
    const mother = this.plant(motherId);
    const generation = mother.generation + 1;
    const strain = this.store.listStrains().find((s) => s.id === mother.strainId);
    const base = strain?.name ?? mother.name.replace(/\s+g\d+.*$/i, '');
    const taken = new Set(this.store.listPlants().map((p) => p.id));
    const plants: Plant[] = [];
    return this.store.tx(() => {
      for (let k = 1; k <= count; k++) {
        let n = k;
        let id = slugify(`${base} g${generation} ${n}`);
        while (taken.has(id)) id = slugify(`${base} g${generation} ${++n + count}`);
        taken.add(id);
        plants.push(
          this.store.putPlant({
            id,
            name: `${base} g${generation} #${n}`,
            strainId: mother.strainId,
            breederId: mother.breederId,
            generation,
            motherId: mother.id,
            potId: null,
            medium: mother.medium,
            startedOn: this.today(),
            notes: `Cutting of ${mother.name}.`,
          }),
        );
      }
      const warning =
        generation > GENERATION_WARNING
          ? `generation ${generation} is past ${GENERATION_WARNING}: consider starting again from seed`
          : null;
      return { plants, warning };
    });
  }

  /** Records the harvest (today unless given) and frees the pot; the plant keeps its pot as history. */
  harvest(plantId: string, date?: string, yieldGrams?: number | null): Plant {
    const p = this.plant(plantId);
    if (p.harvestedOn) throw new BadReference(`${p.name} was already harvested on ${p.harvestedOn}`);
    return this.store.putPlant({ ...p, harvestedOn: date ?? this.today(), yieldGrams: yieldGrams ?? p.yieldGrams });
  }

  /** Puts a plant that is growing elsewhere into a free pot. */
  place(potId: string, plantId: string): Plant {
    const p = this.plant(plantId);
    if (!this.store.listPots().some((x) => x.id === potId)) throw new NotFound(`pot ${potId}`);
    if (p.harvestedOn) throw new BadReference(`${p.name} was harvested on ${p.harvestedOn}`);
    if (p.potId === potId) return p;
    if (p.potId && this.store.plantInPot(p.potId)?.id === p.id)
      throw new BadReference(`${p.name} is in ${p.potId}: harvest it, or edit it to move it`);
    return this.store.putPlant({ ...p, potId });
  }
}
