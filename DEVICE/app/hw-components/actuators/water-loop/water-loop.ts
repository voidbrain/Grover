import moment from "moment";
import schedule from "node-schedule";

import { CronJobInterface } from "../../../interfaces/cron-job";
import {
  EventEmitter,
  Peripherals,
  ServerCommands,
  DevicesStatus,
} from "../../../services/settings/enums";

class WaterLoopComponent {
  id: number;
  parentId: number;
  parentName: string;
  serialNumber: { sn: string; found: boolean };

  i2cAddress: string;
  pin: number;
  status: string;

  scheduledCrons: any[] = [];
  api;
  settings;
  db;

  mcp;

  debug = false;

  constructor(
    parentId: number,
    parentName: string,
    id: number,
    i2cAddress: number,
    pin: number,
    scheduleArr,
    db,
    api,
    settings,
  ) {
    this.id = id;
    this.parentId = parentId;
    this.parentName = parentName;
    this.i2cAddress = "0x" + parseInt(i2cAddress.toString(10)).toString(16);
    this.pin = +pin;
    this.db = db;
    this.api = api;
    this.settings = settings;
    this.scheduledCrons = scheduleArr;
  }

  async setup() {
    this.serialNumber = await this.settings.getSerialNumber();
    if (true) {
      //(this.serialNumber.found && +this.i2cAddress) {
      import("node-mcp23017").then(({ default: MCP23017 }) => {
        this.mcp = new MCP23017({
          address: +this.i2cAddress,
          device: 1,
          debug: false,
        });
        this.mcp.pinMode(this.pin, this.mcp.OUTPUT);
      });

      this.setSchedule();
    } else {
      if (this.debug) {
        console.log(
          "[WATER-LOOP]: EXIT on --> Raspberry OR i2c Address not found",
        );
      }
    }
  }

  public async ON({ expectedTime, eventEmitter, operatingMode }) {
    return new Promise(async (resolve) => {
      const systemOperatingMode = this.settings.getOperatingMode();
      if (operatingMode >= systemOperatingMode) {
        const job = {
          eventEmitter,
          action: ServerCommands.ON,
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
        switch (eventEmitter) {
          case EventEmitter.user: // manual action
            if (this.debug) {
              console.log("[WATER-LOOP]: ON manual", job);
            }
            if (this.settings.getLogMode() === true) {
              await this.db.logItem("workers_log", job);
              resolve(job);
            }
            break;
          case EventEmitter.schedule: // scheduled action
            if (this.debug) {
              console.log("[WATER-LOOP]: ON scheduled", job);
            }
            if (this.settings.getLogMode() === true) {
              await this.db.logItem("workers_log", job);
              resolve;
            }
            break;
        }
      } else {
        if (this.debug) {
          console.log(
            `[WATER-LOOP]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`,
          );
        }
      }
    });
  }

  public async OFF({ expectedTime, eventEmitter, operatingMode }) {
    return new Promise(async (resolve) => {
      const systemOperatingMode = this.settings.getOperatingMode();
      if (operatingMode >= systemOperatingMode) {
        const job = {
          eventEmitter,
          action: ServerCommands.OFF,
          idWorker: this.id,
          parentId: this.parentId,
          parentName: this.parentName,
          type: Peripherals.Worker,
          expectedTime: expectedTime ? new Date(expectedTime) : null,
          executedTime: new Date(),
          operatingMode: operatingMode,
          systemOperatingMode: systemOperatingMode,
          serialNumber: this.serialNumber.sn,
        };
        switch (eventEmitter) {
          case EventEmitter.user: // manual action
            if (this.debug) {
              console.log("[WATER-LOOP]: OFF manual");
            }
            if (this.settings.getLogMode() === true) {
              await this.db.logItem("workers_log", job);
              resolve(job);
            }
            break;
          case EventEmitter.schedule: // scheduled action
            if (this.debug) {
              console.log("[WATER-LOOP]: OFF scheduled");
            }
            if (this.settings.getLogMode() === true) {
              await this.db.logItem("workers_log", job);
              resolve;
            }
            break;
        }
      } else {
        if (this.debug) {
          console.log(
            `[WATER-LOOP]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`,
          );
        }
      }
    });
  }

  async setStatus(eventEmitter) {
    let scheduledStart;
    const now = moment();
    let status: string;
    let operatingMode: number;
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
    this.status = status!;
    if (this.status) {
      // status from cron
      this[this.status]({
        expectedTime: scheduledStart,
        eventEmitter,
        operatingMode: operatingMode!,
      });
    } else {
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
        operatingMode: operatingMode!,
        systemOperatingMode: systemOperatingMode,
        serialNumber: this.serialNumber.sn,
      };
      await this.db.logItem("workers_log", job);
    }
  }

  async setSchedule() {
    if (this.id && this.scheduledCrons) {
      const scheduleArr: CronJobInterface[] = [];
      this.scheduledCrons.map((probeScheduleRow) => {
        const scheduleRow: CronJobInterface = {
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
          await eval(
            `this.${job.action}({
              expectedTime: '${expectedTime}', 
              eventEmitter: '${eventEmitter}', 
              operatingMode: ${job.operatingMode},
              duration: ${job.duration}
            })`,
          );
        });
      });
    }
  }
}
export default WaterLoopComponent;
