import { Dose } from './dose';

export interface Phase {
  id: number;
  name: Text;
  idDose: number;
  pos: number;
  duration: number;
  dose?: Dose;
  isBlooming: boolean;
  minEC: number;
  maxEC: number;
  minPh: number;
  maxph: number;
}

export interface PhaseExtended extends Phase {
  percentDuration: number;
  percentStart: number;
  percentEnd: number;
  daysFromGrow: number;
  daysFromBloom: number;
  startingDay: number;
  isActive: boolean;
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
}
