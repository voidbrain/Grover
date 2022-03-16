export interface CronJobInterface {
  cron: string; 
  action: string;
  operatingMode: number;
  duration?: number
}
