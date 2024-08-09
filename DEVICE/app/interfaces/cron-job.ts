export interface CronJobInterface {
  cron: string;
  action: string;
  operatingMode: number;
  duration?: number;
}
export interface ExtendedCronJobInterface extends CronJobInterface {
  atHour: number;
  atMinute: number;
  atDay: number;
}
