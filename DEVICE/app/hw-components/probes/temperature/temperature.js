import "module-alias/register";
import { EventEmitter, Peripherals, ServerCommands, DevicesStatus, } from "../../../services/settings/enums.ts";
import schedule from "node-schedule";
import moment from "moment";
import isPi from "detect-rpi";
let sensor;
let isMock = false;
if (isPi()) {
    const { default: ds18x20 } = await import("ds18x20");
    sensor = ds18x20;
}
else {
    const { default: ds18x20Mock } = await import("../../../../mocks/ds18x20.cjs");
    sensor = ds18x20Mock;
    isMock = true;
}
console.log(sensor, "isMock:" + isMock);
class TemperatureComponent {
    constructor(parentId, parentName, id, address, scheduleArr, db, api, settings) {
        this.scheduledCrons = [];
        this.debug = false;
        this.id = id;
        this.parentId = parentId;
        this.parentName = parentName;
        this.address = address;
        this.scheduledCrons = scheduleArr;
        this.settings = settings;
        this.api = api;
        this.db = db;
    }
    async setup() {
        this.serialNumber = await this.settings.getSerialNumber();
        this.setSchedule();
    }
    async setStatus(eventEmitter) {
        let scheduledStart;
        const now = moment();
        let status;
        let operatingMode;
        this.scheduledCrons.map((cron) => {
            const statusStart = moment({
                year: now.year(),
                month: now.month(),
                day: now.date(),
                hour: cron.atHour,
                minute: cron.atMinute,
            });
            if (statusStart <= now) {
                status = cron.action;
                scheduledStart = statusStart;
                operatingMode = cron.operatingMode;
            }
        });
        this.status = status;
        if (this.status) {
            // status from cron
            self[this.status]({
                expectedTime: scheduledStart,
                eventEmitter,
                operatingMode: operatingMode,
            });
        }
        else {
            // default off
            this.status = DevicesStatus.OFF;
            if (this.debug) {
                console.log("[TEMPERATURE]: status", this.status);
            }
            const systemOperatingMode = this.settings.getOperatingMode();
            const expectedTime = null;
            const job = {
                eventEmitter,
                action: ServerCommands.SET_STATUS,
                idProbe: this.id,
                parentId: this.parentId,
                parentName: this.parentName,
                type: Peripherals.Probe,
                expectedTime,
                executedTime: new Date(),
                operatingMode: operatingMode,
                systemOperatingMode: systemOperatingMode,
                serialNumber: this.serialNumber.sn,
            };
            await this.db.logItem("probes_log", job);
        }
    }
    async READ({ expectedTime, eventEmitter, operatingMode, }) {
        try {
            // Check operating mode
            const systemOperatingMode = this.settings.getOperatingMode();
            if (operatingMode < systemOperatingMode) {
                if (this.debug) {
                    console.log(`[TEMP]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`);
                }
                throw new Error("Operating mode insufficient");
            }
            // Read from sensor
            const value = await this.getSensorValue();
            // Prepare job details
            const job = {
                eventEmitter,
                action: ServerCommands.READ,
                value,
                idProbe: this.id,
                parentId: this.parentId,
                parentName: this.parentName,
                type: Peripherals.Probe,
                address: this.address,
                expectedTime: expectedTime ? new Date(expectedTime) : null,
                executedTime: new Date(),
                operatingMode,
                systemOperatingMode,
                serialNumber: this.serialNumber.sn,
            };
            console.log(eventEmitter);
            // Log and return job details
            if (this.debug) {
                console.log(`[TEMP]: READ ${eventEmitter}`, job);
            }
            if (this.settings.getLogMode()) {
                await this.db.logItem("probes_log", job);
            }
            else {
                console.log("Don't log");
            }
            return job;
        }
        catch (error) {
            if (this.debug) {
                console.log(`[TEMP]: READ ${eventEmitter}, error: ${error}`);
            }
            throw error; // Propagate the error to be handled by the caller
        }
    }
    // Helper method to get sensor value
    getSensorValue() {
        return new Promise((resolve, reject) => {
            sensor.get(this.address, (err, value) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(value);
                }
            });
        });
    }
    async setSchedule() {
        if (this.id && this.scheduledCrons) {
            const scheduleArr = [];
            this.scheduledCrons.map((probeScheduleRow) => {
                const scheduleRow = {
                    action: probeScheduleRow.action,
                    cron: `${probeScheduleRow.atMinute} ${probeScheduleRow.atHour} * * ${probeScheduleRow.atDay}`,
                    operatingMode: probeScheduleRow.operatingMode,
                };
                scheduleArr.push(scheduleRow);
            });
            scheduleArr.map((job) => {
                schedule.scheduleJob(job.cron, async (expectedTime) => {
                    const eventEmitter = EventEmitter.schedule;
                    await eval(`this.${job.action}({
              expectedTime: '${expectedTime}', 
              eventEmitter: '${eventEmitter}', 
              operatingMode: ${job.operatingMode}
            })`);
                });
            });
        }
    }
}
export default TemperatureComponent;
