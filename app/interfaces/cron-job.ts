export interface ComponentScenarioInterface {
  id: number; 
  running: boolean;
}
export interface CronJobInterface {
  cron: string; 
  action: string;
  scenarios: ComponentScenarioInterface[];
  options: {
    busy?: boolean;
  };
}
