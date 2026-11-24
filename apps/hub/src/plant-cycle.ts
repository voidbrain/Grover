import { GENERATION_WARNING, localTime, type Plant } from '@grover/contracts';
import { slugify } from '@grover/contracts/kinds';
import { BadReference, NotFound, type Store } from './store.ts';

/**
 * The owner's plant cycle (F-013): plants start elsewhere (no pot), are placed in a free pot, cuttings are taken
 * from a plant in the tent (they start elsewhere as the next generation), and a harvest frees the pot.
 */
export class PlantCycle {
  private readonly store: Store;
  private readonly today: () => string;
  /** `timeZone`: the grow's, so "today" changes at local midnight. */
  constructor(store: Store, timeZone: string, now: () => number = Date.now) {
    this.store = store;
    this.today = () => localTime(new Date(now()), timeZone).day;
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
    const all = this.store.listPlants();
    const taken = new Set(all.map((p) => p.id));
    // Number cuttings on from the highest already taken from this mother, so names and ids stay in step across
    // calls. The id keeps room for its suffix (slugify cuts at 48 characters; a long strain name must not eat it).
    const numbers = all.filter((p) => p.motherId === mother.id).map((p) => Number(/#(\d+)$/.exec(p.name)?.[1] ?? 0));
    let n = Math.max(0, ...numbers);
    const stem = slugify(base).slice(0, 36).replace(/-+$/, '');
    const plants: Plant[] = [];
    return this.store.tx(() => {
      for (let k = 1; k <= count; k++) {
        let id: string;
        do id = `${stem}-g${generation}-${++n}`;
        while (taken.has(id) && n < 10_000);
        if (taken.has(id)) throw new BadReference(`no free id for a cutting of ${mother.name}`);
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
    if (date && date > this.today())
      throw new BadReference(`${date} is in the future: record a harvest when it happens`);
    return this.store.putPlant({ ...p, harvestedOn: date ?? this.today(), yieldGrams: yieldGrams ?? p.yieldGrams });
  }

  /** Records the switch to flowering (today): the plant's phase moves on, and the light if it follows this plant. */
  markBloom(plantId: string): Plant {
    const p = this.plant(plantId);
    if (p.harvestedOn) throw new BadReference(`${p.name} was harvested on ${p.harvestedOn}`);
    if (p.bloomOn) throw new BadReference(`${p.name} switched to bloom on ${p.bloomOn}`);
    return this.store.putPlant({ ...p, bloomOn: this.today() });
  }

  /** Records the start of the flush (today). */
  markFlush(plantId: string): Plant {
    const p = this.plant(plantId);
    if (p.harvestedOn) throw new BadReference(`${p.name} was harvested on ${p.harvestedOn}`);
    if (!p.bloomOn) throw new BadReference(`${p.name} has not switched to bloom yet`);
    if (p.flushOn) throw new BadReference(`${p.name} started its flush on ${p.flushOn}`);
    return this.store.putPlant({ ...p, flushOn: this.today() });
  }

  /** Puts a plant that is growing elsewhere into a free pot. */
  place(potId: string, plantId: string): Plant {
    const p = this.plant(plantId);
    if (!this.store.listPots().some((x) => x.id === potId)) throw new NotFound(`pot ${potId}`);
    if (p.harvestedOn) throw new BadReference(`${p.name} was harvested on ${p.harvestedOn}`);
    if (p.potId === potId) return p;
    if (p.potId && this.store.plantInPot(p.potId)?.id === p.id)
      throw new BadReference(`${p.name} is in ${p.potId}: harvest it, or edit it to move it`);
    return this.store.putPlant({ ...p, potId, placedOn: this.today() });
  }
}
