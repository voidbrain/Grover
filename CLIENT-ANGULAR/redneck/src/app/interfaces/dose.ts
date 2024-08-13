export interface DoseInterface {
  id?: number;
  name: string;
  grow: number;
  micro: number;
  bloom: number;
  ripen: number;
  pHDown: number;
  water: number;
  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
  color: string;
}

// PH = 5.8 +/- 0.5

export interface DoseExtendedInterface extends DoseInterface {
  chartConfig: object;
  EC: number;

  synced?: number;
}