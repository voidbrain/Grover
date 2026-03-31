import schedule from "node-schedule";
import { EventEmitter } from "../../app/services/settings/enums.ts";
export class Scheduler {
    constructor(db) {
        this.db = db;
    }
    async setMainSchedule() {
        const scheduledCrons = (await this.db.getItems("system_schedule"));
        console.log(scheduledCrons);
        const scheduleArr = scheduledCrons.map((systemScheduleRow) => ({
            action: systemScheduleRow.action,
            cron: `${systemScheduleRow.atMinute} ${systemScheduleRow.atHour} * * ${systemScheduleRow.atDay}`,
            operatingMode: systemScheduleRow.operatingMode,
        }));
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
