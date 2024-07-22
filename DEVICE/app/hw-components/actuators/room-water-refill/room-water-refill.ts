import { CronJobInterface } from "../../../interfaces/cron-job";
import {
  Owner,
  DevicesStatus,
  ServerCommands,
  Peripherals,
} from "../../../services/settings/enums";

import schedule from "node-schedule";
import moment from "moment";

class RoomWaterRefillComponent {
  id: number;
  parentId: number;
  parentName: string;
  i2cAddress: string;
  pin1: number;
  pin2: number;
  primaryWaterPump;

  serialNumber: { sn: string; found: boolean };

  scheduledCrons: any[] = [];
  api;
  settings;
  db;
  debug = false;
  status: string;

  constructor(
    parentId: number,
    parentName: string,
    id: number,
    i2cAddress: number,
    pin1: number,
    pin2: number,
    scheduleArr,
    db,
    api,
    settings
  ) {
    this.id = id;
    this.parentId = parentId;
    this.parentName = parentName;
    this.i2cAddress = "0x" + parseInt(i2cAddress.toString(10)).toString(16);
    this.pin1 = +pin1;
    this.pin2 = +pin2;
    this.api = api;
    this.db = db;
    this.settings = settings;
    this.scheduledCrons = scheduleArr;
  }

  async setup() {
    const self = this;
    self.serialNumber = await self.settings.getSerialNumber();
    if (self.serialNumber.found && +self.i2cAddress) {
      import("node-mcp23017").then(({ default: MCP23017 }) => {
        this.primaryWaterPump = new MCP23017({
          address: +self.i2cAddress,
          device: 1,
          debug: false,
        });
        this.primaryWaterPump.pinMode(this.pin1, this.primaryWaterPump.OUTPUT);
        this.primaryWaterPump.pinMode(this.pin2, this.primaryWaterPump.OUTPUT);
      });
      this.setSchedule(this.id, this.scheduledCrons);
    } else {
      console.log(
        "[ROOM-WATER-REFILL]: EXIT on --> Raspberry OR i2c Address not found"
      );
    }
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
        console.log("[ROOM-WATER-REFILL]: status", self.status);
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

  public async delay(milliseconds) {
    return new Promise((resolve) => {
      return setTimeout(() => {
        resolve(true);
      }, milliseconds);
    });
  }

  public async forward() {
    return new Promise((resolve, reject) => {
      console.log("[ROOM-WATER-REFILL]: forward");
      this.primaryWaterPump.digitalWrite(this.pin1, this.primaryWaterPump.HIGH);
      this.primaryWaterPump.digitalWrite(this.pin2, this.primaryWaterPump.LOW);
      resolve(true);
    });
  }

  public async backward() {
    return new Promise((resolve) => {
      console.log("[ROOM-WATER-REFILL]: backward");
      this.primaryWaterPump.digitalWrite(this.pin1, this.primaryWaterPump.LOW);
      this.primaryWaterPump.digitalWrite(this.pin2, this.primaryWaterPump.HIGH);
      resolve(true);
    });
  }

  public async stop() {
    console.log("[ROOM-WATER-REFILL]: stop");
    return new Promise((resolve) => {
      this.primaryWaterPump.digitalWrite(this.pin1, this.primaryWaterPump.LOW);
      this.primaryWaterPump.digitalWrite(this.pin2, this.primaryWaterPump.LOW);
      resolve(true);
    });
  }

  async setSchedule(id: number, scheduledCrons: any[]) {
    const self = this;
    if (id && scheduledCrons) {
      const scheduleArr: CronJobInterface[] = [];
      scheduledCrons.map((probeScheduleRow) => {
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
          const owner = Owner.schedule;
          const doJob = await eval(
            `this.${job.action}({
              expectedTime: '${expectedTime}', 
              owner: '${owner}', 
              operatingMode: ${job.operatingMode},
              duration: ${job.duration}
            })`
          );
        });
      });
    }
  }
}
export default RoomWaterRefillComponent;
