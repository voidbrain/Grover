export interface Dose {
  id: number;
  name: string;
  grow: number;
  micro: number;
  bloom: number;
  ripen: number;
  phDown: number;
  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
  color: string;
}

// PH = 5.8 +/- 0.5
