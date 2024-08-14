import moment from "moment";

import {
  CronJobInterface,
  ExtendedCronJobInterface,
} from "../../../interfaces/cron-job";
import {
  DevicesStatus,
  EventEmitter,
  Peripherals,
  ServerCommands,
} from "../../../services/settings/enums";

import schedule from "node-schedule";

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

class FanComponent {
  id: number | string | undefined;
  parentId: number;
  parentName: string;
  serialNumber: { sn: string; found: boolean };

  i2cAddress: number | string | undefined;
  pin: number | string | undefined;
  status: string;

  scheduledCrons: ExtendedCronJobInterface[] = [];
  api;
  settings;
  db;

  mcp;
  debug = false;

  constructor(
    parentId: number,
    parentName: string,
    id: number | string | undefined,
    i2cAddress: number | string | undefined,
    pin: number | string | undefined,
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
    this.setSchedule(this.id, this.scheduledCrons);
  }

  public async ON({
    expectedTime,
    eventEmitter,
    operatingMode,
  }: {
    expectedTime: Date;
    eventEmitter: EventEmitter;
    operatingMode: number;
  }): Promise<unknown> {
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
        operatingMode,
        systemOperatingMode,
        serialNumber: this.serialNumber.sn,
      };

      try {
        if (this.debug) {
          console.log(
            `[FAN-MOTOR]: ON ${eventEmitter === EventEmitter.user ? "manual" : "scheduled"}`,
            job,
          );
        }

        if (this.settings.getLogMode() === true) {
          await this.db.logItem("workers_log", job);
        }

        return job;
      } catch (err) {
        console.error("Error logging job:", err);
        throw err; // Re-throw the error to handle it upstream
      }
    } else {
      if (this.debug) {
        console.log(
          `[FAN-MOTOR]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`,
        );
      }
      return null; // Or throw an error if you prefer
    }
  }

  public async OFF({
    expectedTime,
    eventEmitter,
    operatingMode,
  }: {
    expectedTime: Date | null;
    eventEmitter: EventEmitter;
    operatingMode: number;
  }): Promise<unknown> {
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
        operatingMode,
        systemOperatingMode,
        serialNumber: this.serialNumber.sn,
      };

      try {
        if (this.debug) {
          console.log(
            `[FAN-MOTOR]: OFF ${eventEmitter === EventEmitter.user ? "manual" : "scheduled"}`,
          );
        }

        if (this.settings.getLogMode() === true) {
          await this.db.logItem("workers_log", job);
        }

        return job;
      } catch (err) {
        console.error("Error logging job:", err);
        throw err; // Re-throw the error to handle it upstream
      }
    } else {
      if (this.debug) {
        console.log(
          `[FAN-MOTOR]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`,
        );
      }
      return null; // Or throw an error if you prefer
    }
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
        console.log("[FAN-MOTOR]: status", this.status);
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
              operatingMode: ${job.operatingMode}
            })`,
          );
        });
      });
    }
  }
}
export default FanComponent;
