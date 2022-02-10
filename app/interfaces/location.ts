import { CronJobInterface } from './cron-job';
export interface LocationInterface {
  id: string;
  waterTemperatureProbeID: string;
  waterRefillDNum: number;
  waterRefillEnPin: number;
  waterRefillIn1Pin: number;
  waterRefillIn2Pin: number;
  waterTemperatureProbeSchedule: CronJobInterface[];
}
