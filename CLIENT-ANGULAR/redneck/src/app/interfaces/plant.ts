export interface Plant {
  id: number;
  id_strain: number;
  //man_tasks					: Calendarmantask[];
  id_company: number;
  id_growing_scenario: number;
  id_growing_medium: number;
  generation: number;
  day_start_grow: number;
  day_harvest: number;
  day_start_bloom: number;
  revenue: number;
  alerts: string;
  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;

  calendar_macrotask_image: number;
  calendar_macrotask_date: number;
  tasks_class: string;
  tasks_alert: string;
  tasks_time: string;
  icon: string;
}
