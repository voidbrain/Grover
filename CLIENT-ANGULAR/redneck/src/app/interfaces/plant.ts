import { Strain } from './strain';
import { Pot } from './pot';
import { Location } from './location';
import { Calendar, PhaseExtended } from './calendar';

export interface VoidPlant {
  idPot: null;
}
export interface Plant {
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

export interface PlantExtended extends Plant {
  plant: any;
  strain: Strain;
  expanded: boolean;
  pot: Pot;
  daysFromGrow?: number;
  daysFromBloom?: number;
  dayStartFlush?: number;
  daysFromFlush?: number;
  phase?: PhaseExtended;
  calendar?: Calendar;
  location?: Location; // Location;
  probes?: any[];
  workers?: any[];
  workersComponents: {
    waterLoop: any;
  };
}
