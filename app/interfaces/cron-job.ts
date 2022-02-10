export interface CronJobInterface {
  cron: string; 
  action: string;
  options: {
    busy?: boolean;
  };
}
