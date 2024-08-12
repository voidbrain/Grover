import { Dose } from './dose';

export interface Phase {
  id: number;
  name: Text;
  idDose: number;
  pos: number;
  duration: number;
  dose?: Dose;
  isBlooming: boolean;
  isFlushing: boolean;
  minEC: number;
  maxEC: number;
  minPh: number;
  maxPh: number;
  maxTemp: number;
  minTemp: number;
  minWaterLevel: number;
  maxWaterLevel: number;
}

export interface PhaseExtended extends Phase {
  percentDuration: number;
  percentStart: number;
  percentEnd: number;
  daysFromGrow: number;
  daysFromBloom: number;
  daysFromFlush: number;
  startingDay: number;
  isActive: boolean;
  startPhaseDay?: number;
  boxPercentDuration?: number;
}

export interface Calendar {
  id: number;
  // weekN: number;
  name: string;
  // idDose: number;
  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
  phases: PhaseExtended[];
  color?: string;
}

export interface CalendarExtended extends Calendar {
  doses?: PhaseExtended[];
  chartConfig: object;
}
