import { DoseInterface } from "./dose";

export interface PhaseInterface {
  id: number;
  name: Text;
  idDose: number;
  pos: number;
  duration: number;
  dose?: DoseInterface;
  isBlooming: boolean;
  minEC: number;
  maxEC: number;
  minPh: number;
  maxph: number;
}

export interface PhaseExtended extends PhaseInterface {
  percentDuration: number;
  percentStart: number;
  percentEnd: number;
  daysFromGrow: number;
  daysFromBloom: number;
  startingDay: number;
  isActive: boolean;
}
