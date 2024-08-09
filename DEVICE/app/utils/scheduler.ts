import schedule from "node-schedule";
import { DbService } from "../services/db/db.service";
import { CronJobInterface } from "../../app/interfaces/cron-job";

export class Scheduler {
  constructor(private db: DbService) {}

  async setMainSchedule() {
    const scheduledCrons: any[] = await this.db.getItems("system_schedule");
    const scheduleArr: CronJobInterface[] = scheduledCrons.map(
      (systemScheduleRow) => ({
        action: systemScheduleRow.action,
        cron: `${systemScheduleRow.atMinute} ${systemScheduleRow.atHour} * * ${systemScheduleRow.atDay}`,
        operatingMode: systemScheduleRow.operatingMode,
      }),
    );

    scheduleArr.forEach((job) => {
      schedule.scheduleJob(job.cron, async (expectedTime) => {
        // Schedule handling logic
      });
    });
  }
}
