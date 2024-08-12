import { StrainInterface } from './strain';
import { PotInterface } from './pot';
import { Calendar, PhaseExtendedInterface } from './calendar';
import { ProbeInterface } from './probe';
import { WorkerInterface } from './worker';
import { WaterLoopInterface } from './water-loop';

export interface PlantInterface {
  alerts: string;
  dayHarvest: number | null;
  daySecondTrimming: number | null;
  dayStartBloom: number | null;
  dayStartGrow: number | null;
  dayTrimming: number | null;
  dayPruning: number | null;
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
  calendar?: Calendar;
  location?: Location; // Location;
  probes?: ProbeInterface[];
  workers?: WorkerInterface[];
  workersComponents: {
    waterLoop: WaterLoopInterface;
  };
}
