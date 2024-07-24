/* eslint-disable @typescript-eslint/naming-convention */

import { Strain } from './strain';
import { Pot } from './pot';
import { Location } from './location';
import { Calendar, PhaseExtended } from './calendar';

export interface Plant {
  alerts: string;
  dayHarvest: number;
  daySecondTrimming: number;
  dayStartBloom: number;
  dayStartGrow: number;
  dayTrimming: number;
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
  strain: Strain;
  expanded: boolean;
  pot: Pot;
  daysFromGrow?: number;
  daysFromBloom?: number;
  dayStartFlush?: number;
  daysFromFlush?: number;
  phase?: PhaseExtended;
  calendar?: Calendar;
  location?: any; // Location;
  probes?;
  workers?;
  workersComponents: {
    waterLoop: any;
  };
}
