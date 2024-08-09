// import i2cBus from 'i2c-bus';

import {
  CronJobInterface,
  ExtendedCronJobInterface,
} from "../../../interfaces/cron-job";
import {
  EventEmitter,
  Peripherals,
  ServerCommands,
  DevicesStatus,
} from "../../../services/settings/enums";

import schedule from "node-schedule";
import moment from "moment";

class RoomBloomRefillComponent {
  id:  number | string | undefined;
  parentId: number;
  parentName: string;
  i2cAddress:  number | string | undefined;
  pin1: number | undefined;
  pin2: number | undefined;
  primaryBloomPump;

  serialNumber: { sn: string; found: boolean };

  scheduledCrons: ExtendedCronJobInterface[] = [];
  api;
  settings;
  db;
  debug = false;
  status: string;

  constructor(
    parentId: number,
    parentName: string,
    id: number | string | undefined,
    i2cAddress: number | string | undefined,
    pin1: number | undefined,
    pin2: number | undefined,
    scheduleArr,
    db,
    api,
    settings,
  ) {
    this.id = id;
    this.parentId = parentId;
    this.parentName = parentName;
    this.i2cAddress = "0x" + parseInt((i2cAddress ?? '').toString(10)).toString(16);
    this.pin1 = +(pin1 ?? 0);
    this.pin2 = +(pin2 ?? 0);
    this.api = api;
    this.db = db;
    this.settings = settings;
    this.scheduledCrons = scheduleArr;
  }

  async setup() {
    import("node-mcp23017").then(({ default: MCP23017 }) => {
      this.primaryBloomPump = new MCP23017({
        address: +(this.i2cAddress ?? ''),
        device: 1,
        debug: false,
      });
      this.primaryBloomPump.pinMode(this.pin1, this.primaryBloomPump.OUTPUT);
      this.primaryBloomPump.pinMode(this.pin2, this.primaryBloomPump.OUTPUT);
    });
    this.setSchedule(this.id, this.scheduledCrons);
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
        console.log("[ROOM-Bloom-REFILL]: status", this.status);
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

  public async delay(milliseconds) {
    return new Promise((resolve) => {
      return setTimeout(() => {
        resolve(true);
      }, milliseconds);
    });
  }

  public async forward() {
    console.log("[ROOM-Bloom-REFILL]: forward");
    return new Promise((resolve) => {
      this.primaryBloomPump.digitalWrite(this.pin1, this.primaryBloomPump.HIGH);
      this.primaryBloomPump.digitalWrite(this.pin2, this.primaryBloomPump.LOW);
      resolve(true);
    });
  }

  public async backward() {
    return new Promise((resolve) => {
      this.primaryBloomPump.digitalWrite(this.pin1, this.primaryBloomPump.LOW);
      this.primaryBloomPump.digitalWrite(this.pin2, this.primaryBloomPump.HIGH);
      resolve(true);
    });
  }

  public async stop() {
    console.log("[ROOM-Bloom-REFILL]: stop");
    return new Promise((resolve) => {
      this.primaryBloomPump.digitalWrite(this.pin1, this.primaryBloomPump.LOW);
      this.primaryBloomPump.digitalWrite(this.pin2, this.primaryBloomPump.LOW);
      resolve(true);
    });
  }

  async setSchedule(id: number | string | undefined, scheduledCrons: ExtendedCronJobInterface[]) {
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
export default RoomBloomRefillComponent;
