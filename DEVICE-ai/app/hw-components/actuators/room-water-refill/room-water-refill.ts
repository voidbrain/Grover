import {
  CronJobInterface,
  ExtendedCronJobInterface,
} from "../../../interfaces/cron-job";
import {
  EventEmitter,
  DevicesStatus,
  ServerCommands,
  Peripherals,
} from "../../../services/settings/enums.ts";

import schedule from "node-schedule";
import moment from "moment";

import isPi from "detect-rpi";
let sensor;
let isMock = false;
if (isPi()) {
  const { default: mcp } = await import("node-mcp23017");
  sensor = mcp;
} else {
  const { default: mcpMock } = await import(
    "../../../../mocks/node-mcp23017.cjs"
  );
  sensor = mcpMock;
  isMock = true;
}
console.log(sensor, "isMock:" + isMock);

class RoomWaterRefillComponent {
  id: number | string | undefined;
  parentId: number;
  parentName: string;
  i2cAddress: number | string | undefined;
  pin1: number;
  pin2: number;
  primaryWaterPump;

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
    this.i2cAddress =
      "0x" + parseInt((i2cAddress ?? "").toString(10)).toString(16);
    this.pin1 = +(pin1 ?? 0);
    this.pin2 = +(pin2 ?? 0);
    this.api = api;
    this.db = db;
    this.settings = settings;
    this.scheduledCrons = scheduleArr;
  }

  async setup() {
    this.primaryWaterPump = new sensor({
      address: +(this.i2cAddress ?? ""),
      device: 1,
      debug: false,
    });
    this.primaryWaterPump.pinMode(this.pin1, this.primaryWaterPump.OUTPUT);
    this.primaryWaterPump.pinMode(this.pin2, this.primaryWaterPump.OUTPUT);

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
      self[this.status]({
        expectedTime: scheduledStart,
        eventEmitter,
        operatingMode: operatingMode!,
      });
    } else {
      // default off
      this.status = DevicesStatus.OFF;
      if (this.debug) {
        console.log("[ROOM-WATER-REFILL]: status", this.status);
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
    return new Promise((resolve) => {
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

  public async RUN_WATER({
    expectedTime,
    eventEmitter,
    operatingMode,
    duration,
  }: {
    expectedTime?: string;
    eventEmitter: EventEmitter;
    operatingMode: number;
    duration: number;
  }): Promise<boolean> {
    try {
      const systemOperatingMode = this.settings.getOperatingMode();

      if (operatingMode < systemOperatingMode) {
        if (this.debug) {
          console.log(
            `[ROOM-WATER-REFILL]: RUN_WATER operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`,
          );
        }
        return false; // Exit early if operating mode is insufficient
      }

      await this.forward();
      await this.delay(duration);
      await this.stop();

      const job = {
        eventEmitter,
        action: ServerCommands.RUN_WATER,
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
        console.log(
          `[ROOM-WATER-REFILL]: RUN_WATER ${eventEmitter === EventEmitter.user ? "manual" : "scheduled"}`,
          job,
        );
      }

      if (this.settings.getLogMode()) {
        await this.db.logItem("workers_log", job);
      }

      return true;
    } catch (error) {
      console.error("[ROOM-WATER-REFILL]: Error in RUN_WATER action", error);
      throw error; // Ensure errors are propagated
    }
  }

  async setSchedule(
    id: number | string | undefined,
    scheduledCrons: ExtendedCronJobInterface[],
  ) {
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
export default RoomWaterRefillComponent;
