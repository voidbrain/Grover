import { ChartConfiguration } from "chart.js";

export interface StrainInterface {
  id: number;
  name: string;
  lineage: string;
  percentSativa: number;
  companyId: number;
  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
  synced?: number;

  chartConfig?: ChartConfiguration
}
