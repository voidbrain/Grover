import { ChartConfiguration } from 'chart.js';
import { DoseInterface } from './dose';

export interface PhaseInterface {
  id: number;
  name: Text;
  idDose: number;
  pos: number;
  duration: number;
  dose?: DoseInterface;
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

export interface PhaseExtendedInterface extends PhaseInterface {
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
  // data?: number[];
  // backgroundColor?: string[];
}

export interface CalendarInterface {
  id: number;
  // weekN: number;
  name: string;
  // idDose: number;
  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
  phases: PhaseExtendedInterface[];
  color?: string;
}

export interface CalendarExtendedInterface extends CalendarInterface {
  doses?: PhaseExtendedInterface[];
  chartConfig: ChartConfiguration;
}
