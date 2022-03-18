import moment from "moment";

import { CronJobInterface } from "../../../interfaces/cron-job";
import {
  Owner,
  Peripherals,
  ServerCommands,
  DevicesStatus,
} from "../../../services/settings/enums";

import schedule from "node-schedule";

class LightSwitchComponent {
  id: number;
  parentId: number;
  parentName: string;
  serialNumber: { sn: string; found: boolean };

  i2cAddress: string;
  pin: number;
  status: string;
  defaultStatus: string = DevicesStatus.OFF;
  scheduledCrons: any[] = [];
  api;
  settings;
  db;

  light;
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
    settings
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
    const self = this;
    self.serialNumber = await self.settings.getSerialNumber();
    if (self.serialNumber.found && +self.i2cAddress) {
      import("node-mcp23017").then(({ default: MCP23017 }) => {
        this.light = new MCP23017({
          address: +self.i2cAddress,
          device: 1,
          debug: false,
        });
        this.light.pinMode(this.pin, this.light.OUTPUT);
      });

      this.setSchedule();
    } else {
      if (this.debug) {
        console.log(
          "[LIGHT-SWITCH]: EXIT on --> Raspberry OR i2c Address not found"
        );
      }
    }
  }

  public async ON({ expectedTime, owner, operatingMode }) {
    const self = this;
    return new Promise(async (resolve) => {
      const systemOperatingMode = self.settings.getOperatingMode();
      if (operatingMode >= systemOperatingMode) {
        const job = {
          owner,
          action: ServerCommands.ON,
          idWorker: self.id,
          parentId: self.parentId,
          parentName: self.parentName,
          type: Peripherals.Worker,
          expectedTime,
          executedTime: new Date(),
          operatingMode: operatingMode,
          systemOperatingMode: systemOperatingMode,
          serialNumber: self.serialNumber.sn,
        };
        switch (owner) {
          case Owner.user: // manual action
            if (this.debug) {
              console.log("[LIGHT-SWITCH]: ON manual", job);
            }
            if (self.settings.getLogMode() === true) {
              await self.db.logItem("workers_log", job);
              resolve(job);
            }
            break;
          case Owner.schedule: // scheduled action
            if (this.debug) {
              console.log("[LIGHT-SWITCH]: ON scheduled", job);
            }
            if (self.settings.getLogMode() === true) {
              await self.db.logItem("workers_log", job);
              resolve;
            }
            break;
        }
      } else {
        if (this.debug) {
          console.log(
            `[LIGHT-SWITCH]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`
          );
        }
      }
    });
  }

  public async OFF({ expectedTime, owner, operatingMode }) {
    const self = this;
    return new Promise(async (resolve) => {
      const systemOperatingMode = self.settings.getOperatingMode();
      if (operatingMode >= systemOperatingMode) {
        const job = {
          owner,
          action: ServerCommands.OFF,
          idWorker: self.id,
          parentId: self.parentId,
          parentName: self.parentName,
          type: Peripherals.Worker,
          expectedTime: expectedTime ? new Date(expectedTime) : null,
          executedTime: new Date(),
          operatingMode: operatingMode,
          systemOperatingMode: systemOperatingMode,
          serialNumber: self.serialNumber.sn,
        };
        switch (owner) {
          case Owner.user: // manual action
            if (this.debug) {
              console.log("[LIGHT-SWITCH]: OFF manual");
            }
            if (self.settings.getLogMode() === true) {
              await self.db.logItem("workers_log", job);
              resolve(job);
            }
            break;
          case Owner.schedule: // scheduled action
            if (this.debug) {
              console.log("[LIGHT-SWITCH]: OFF scheduled");
            }
            if (self.settings.getLogMode() === true) {
              await self.db.logItem("workers_log", job);
              resolve;
            }
            break;
        }
      } else {
        if (this.debug) {
          console.log(
            `[LIGHT-SWITCH]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`
          );
        }
      }
    });
  }

  public async getStatus() {
    return this.status;
  }

  async setStatus(owner) {
    const self = this;
    let scheduledStart;
    const now = moment();
    let status: string;
    let operatingMode: number;
    self.scheduledCrons.map((cron) => {
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
    self.status = status;
    if (self.status) {
      // status from cron
      self[self.status]({
        expectedTime: scheduledStart,
        owner,
        operatingMode,
      });
    } else {
      // default off
      self.status = DevicesStatus.OFF;
      if (this.debug) {
        console.log("[LIGHT-SWITCH]: status", self.status);
      }
      const systemOperatingMode = self.settings.getOperatingMode();
      const expectedTime = null;
      const job = {
        owner,
        action: ServerCommands.SET_STATUS,
        idWorker: self.id,
        parentId: self.parentId,
        parentName: self.parentName,
        type: Peripherals.Worker,
        expectedTime,
        executedTime: new Date(),
        operatingMode: operatingMode,
        systemOperatingMode: systemOperatingMode,
        serialNumber: self.serialNumber.sn,
      };
      await self.db.logItem("workers_log", job);
    }
  }

  async setSchedule() {
    const self = this;
    if (self.id && self.scheduledCrons) {
      const scheduleArr: CronJobInterface[] = [];
      self.scheduledCrons.map((probeScheduleRow) => {
        const scheduleRow: CronJobInterface = {
          action: probeScheduleRow.action,
          cron: `${probeScheduleRow.atMinute} ${probeScheduleRow.atHour} * * ${probeScheduleRow.atDay}`,
          operatingMode: probeScheduleRow.operatingMode,
        };
        scheduleArr.push(scheduleRow);
      });

      scheduleArr.map((job) => {
        schedule.scheduleJob(job.cron, async (expectedTime) => {
          const owner = Owner.schedule;
          const doJob = await eval(
            `this.${job.action}({
              expectedTime: '${expectedTime}', 
              owner: '${owner}', 
              operatingMode: ${job.operatingMode}
            })`
          );
        });
      });
    }
  }
}
export default LightSwitchComponent;
