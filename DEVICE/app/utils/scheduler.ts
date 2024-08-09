import schedule from "node-schedule";
import { DbService } from "../services/db/db.service";
import { ExtendedCronJobInterface } from "../../app/interfaces/cron-job";
import {
  EventEmitter,
} from "../../app/services/settings/enums";

export class Scheduler {
  constructor(private db: DbService) {}

  async setMainSchedule() {
    const scheduledCrons: ExtendedCronJobInterface[] = await this.db.getItems("system_schedule") as  ExtendedCronJobInterface[];
    
    console.log(scheduledCrons);
    const scheduleArr: ExtendedCronJobInterface[] = scheduledCrons.map(
      (systemScheduleRow) => ({
        action: systemScheduleRow.action,
        cron: `${systemScheduleRow.atMinute} ${systemScheduleRow.atHour} * * ${systemScheduleRow.atDay}`,
        operatingMode: systemScheduleRow.operatingMode,
      }),
    ) as ExtendedCronJobInterface[];

    scheduleArr.forEach((job) => {
      schedule.scheduleJob(job.cron, async (expectedTime) => {
        const emitter = EventEmitter.schedule;
        await this[job.action]({
          expectedTime: expectedTime.toISOString(),
          emitter: emitter,
          operatingMode: job.operatingMode,
        });
      });
    });
  }
}
