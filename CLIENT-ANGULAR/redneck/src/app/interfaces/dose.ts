export interface Dose {
  id: number;
  grow: number;
  micro: number;
  bloom: number;
  ripen: number;
  EC: number;
  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
}

// PH = 5.8 +/- 0.5
