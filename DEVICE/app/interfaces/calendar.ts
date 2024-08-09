
import { PhaseExtended } from "./phase";


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
