import { Breeder, Plant, Strain } from '@grover/contracts';
import { breederDraft, plantDraft, strainDraft, toBreeder, toPlant, toStrain } from './plant-drafts';

describe('plant drafts', () => {
  it('round-trip breeders, strains and plants', () => {
    const breeder: Breeder = { id: 'acme', name: 'Acme Seeds', website: 'https://acme.example', notes: '' };
    expect(Breeder.parse(toBreeder(breederDraft(breeder)))).toEqual(breeder);
    const strain: Strain = {
      id: 'cross',
      name: 'Cross',
      breederId: 'acme',
      parentIds: ['a', 'b'],
      sativaPercent: 70,
      thcPercent: 20,
      cbdPercent: null,
      floweringDays: 70,
      autoflower: false,
      notes: 'breeder page',
    };
    expect(Strain.parse(toStrain(strainDraft(strain)))).toEqual(strain);
    const plant: Plant = {
      id: 'gen2',
      name: 'Gen 2',
      strainId: 'cross',
      breederId: 'acme',
      generation: 2,
      motherId: 'gen1',
      potId: 'pot-3',
      medium: 'hydro',
      startedOn: '2026-11-01',
      trimmedOn: null,
      bloomOn: null,
      flushOn: null,
      harvestedOn: null,
      yieldGrams: null,
      notes: '',
    };
    expect(Plant.parse(toPlant(plantDraft(plant)))).toEqual(plant);
  });

  it('a plant set back to generation 0 drops its mother; empty numbers are unknown', () => {
    const d = { ...plantDraft(), id: 'p', name: 'P', generation: 0, motherId: 'm', yieldGrams: '' };
    expect(toPlant(d).motherId).toBeNull();
    expect(toPlant(d).yieldGrams).toBeNull();
    expect(toStrain({ ...strainDraft(), id: 's', name: 'S', parentIds: ['s', 'x'] }).parentIds).toEqual(['x']);
  });
});
