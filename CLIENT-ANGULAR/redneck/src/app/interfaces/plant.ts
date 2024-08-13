import { StrainInterface } from './strain';
import { PotInterface } from './pot';
import { CalendarInterface, PhaseExtendedInterface } from './calendar';
import { ProbeInterface } from './probe';
import { WorkerInterface } from './worker';
import { WaterLoopInterface } from './water-loop';
import { LocationInterface } from './location';

export interface PlantInterface {
  alerts: string;
  dayHarvest?: number;
  daySecondTrimming?: number;
  dayStartBloom?: number;
  dayStartGrow?: number;
  dayTrimming?: number;
  dayPruning?: number;
  deleted: number;
  enabled: number;
  generation: number;
  id: number;
  idCompany: number;
  idGrowingMedium: number;
  idGrowingScenario: number;
  idPot: number;
  idCalendar: number;
  idStrain: number;
  lastUpdate: number;
  notes: string;
  yeld: number;
}

export interface PlantExtendedInterface extends PlantInterface {
  plant: PlantInterface;
  strain: StrainInterface;
  expanded: boolean;
  pot: PotInterface;
  daysFromGrow?: number;
  daysFromBloom?: number;
  dayStartFlush?: number;
  daysFromFlush?: number;
  phase?: PhaseExtendedInterface;
  calendar?: CalendarInterface;
  location?: LocationInterface;
  probes?: ProbeInterface[];
  workers?: WorkerInterface[];
  workersComponents: {
    waterLoop: WaterLoopInterface;
  };
}
