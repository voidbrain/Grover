export interface Dose {
  id: number;
  name: string;
  grow: number;
  micro: number;
  bloom: number;
  ripen: number;
  pHDown: number;

  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
  color: string;
  water: number;
}

// PH = 5.8 +/- 0.5
