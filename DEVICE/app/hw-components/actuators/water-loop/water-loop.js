import moment from "moment";
import schedule from "node-schedule";
import { EventEmitter, Peripherals, ServerCommands, DevicesStatus, } from "../../../services/settings/enums.ts";
import isPi from "detect-rpi";
let sensor;
let isMock = false;
if (isPi()) {
    const { default: mcp } = await import("node-mcp23017");
    sensor = mcp;
}
else {
    const { default: mcpMock } = await import("../../../../mocks/node-mcp23017.cjs");
    sensor = mcpMock;
    isMock = true;
}
console.log(sensor, "isMock:" + isMock);
class WaterLoopComponent {
    constructor(parentId, parentName, id, i2cAddress, pin, scheduleArr, db, api, settings) {
        this.scheduledCrons = [];
        this.debug = false;
        this.id = id;
        this.parentId = parentId;
        this.parentName = parentName;
        this.i2cAddress =
            "0x" + parseInt(i2cAddress ? i2cAddress.toString(10) : "").toString(16);
        this.pin = +(pin ?? 0);
        this.db = db;
        this.api = api;
        this.settings = settings;
        this.scheduledCrons = scheduleArr;
    }
    async setup() {
        this.mcp = new sensor({
            address: +(this.i2cAddress ?? 0),
            device: 1,
            debug: false,
        });
        this.mcp.pinMode(this.pin, this.mcp.OUTPUT);
        this.setSchedule();
    }
    async ON({ expectedTime, eventEmitter, operatingMode, }) {
        try {
            const systemOperatingMode = this.settings.getOperatingMode();
            if (operatingMode < systemOperatingMode) {
                if (this.debug) {
                    console.log(`[WATER-LOOP]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`);
                }
                return false; // Exit early if operating mode is insufficient
            }
            const job = {
                eventEmitter,
                action: ServerCommands.ON,
                idWorker: this.id,
                parentId: this.parentId,
                parentName: this.parentName,
                type: Peripherals.Worker,
                expectedTime,
                executedTime: new Date(),
                operatingMode,
                systemOperatingMode,
                serialNumber: this.serialNumber.sn,
            };
            if (this.debug) {
                console.log(`[WATER-LOOP]: ON ${eventEmitter === EventEmitter.user ? "manual" : "scheduled"}`, job);
            }
            if (this.settings.getLogMode()) {
                await this.db.logItem("workers_log", job);
            }
            return true;
        }
        catch (error) {
            console.error("[WATER-LOOP]: Error in ON action", error);
            throw error; // Ensure errors are propagated
        }
    }
    async OFF({ expectedTime, eventEmitter, operatingMode, }) {
        try {
            const systemOperatingMode = this.settings.getOperatingMode();
            if (operatingMode < systemOperatingMode) {
                if (this.debug) {
                    console.log(`[WATER-LOOP]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`);
                }
                return false; // Exit early if operating mode is insufficient
            }
            const job = {
                eventEmitter,
                action: ServerCommands.OFF,
                idWorker: this.id,
                parentId: this.parentId,
                parentName: this.parentName,
                type: Peripherals.Worker,
                expectedTime: expectedTime ? new Date(expectedTime) : null,
                executedTime: new Date(),
                operatingMode,
                systemOperatingMode,
                serialNumber: this.serialNumber.sn,
            };
            if (this.debug) {
                console.log(`[WATER-LOOP]: OFF ${eventEmitter === EventEmitter.user ? "manual" : "scheduled"}`);
            }
            if (this.settings.getLogMode()) {
                await this.db.logItem("workers_log", job);
            }
            return true;
        }
        catch (error) {
            console.error("[WATER-LOOP]: Error in OFF action", error);
            throw error; // Ensure errors are propagated
        }
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
            this[this.status]({
                expectedTime: scheduledStart,
                eventEmitter,
                operatingMode: operatingMode,
            });
        }
        else {
            // default off
            this.status = DevicesStatus.OFF;
            if (this.debug) {
                console.log("[WATER-LOOP]: status", this.status);
            }
            const systemOperatingMode = this.settings.getOperatingMode();
            const expectedTime = null;
            const job = {
                eventEmitter,
                action: ServerCommands.SET_STATUS,
                idWorker: this.id,
                parentId: this.parentId,
                parentName: this.parentName,
                type: Peripherals.Worker,
                expectedTime,
                executedTime: new Date(),
                operatingMode: operatingMode,
                systemOperatingMode: systemOperatingMode,
                serialNumber: this.serialNumber.sn,
            };
            await this.db.logItem("workers_log", job);
        }
    }
    async setSchedule() {
        if (this.id && this.scheduledCrons) {
            const scheduleArr = [];
            this.scheduledCrons.map((probeScheduleRow) => {
                const scheduleRow = {
                    action: probeScheduleRow.action,
                    cron: `${probeScheduleRow.atMinute} ${probeScheduleRow.atHour} * * ${probeScheduleRow.atDay}`,
                    operatingMode: probeScheduleRow.operatingMode,
                    duration: probeScheduleRow.duration,
                };
                scheduleArr.push(scheduleRow);
            });
            scheduleArr.map((job) => {
                schedule.scheduleJob(job.cron, async (expectedTime) => {
                    const eventEmitter = EventEmitter.schedule;
                    await eval(`this.${job.action}({
              expectedTime: '${expectedTime}', 
              eventEmitter: '${eventEmitter}', 
              operatingMode: ${job.operatingMode},
              duration: ${job.duration}
            })`);
                });
            });
        }
    }
}
export default WaterLoopComponent;
