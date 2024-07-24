export interface Plant {
  id: number;
  idStrain: number;
  //man_tasks					: Calendarmantask[];
  idCompany: number;
  idGrowingScenario: number;
  idGrowingMedium: number;
  generation: number;
  dayStartGrow: number;
  dayHarvest: number;
  dayStartBloom: number;
  revenue: number;
  alerts: string;
  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;

  calendarMacrotaskImage: number;
  calendarMacrotaskDate: number;
  tasksClass: string;
  tasksAlert: string;
  tasksTime: string;
  icon: string;
}
