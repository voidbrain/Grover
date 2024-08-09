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
import { Gpio } from "pigpio";

class WaterLevelComponent {
  id: number;
  parentId: number;
  parentName: string;
  address: string;

  serialNumber: { sn: string; found: boolean };

  scheduledCrons: ExtendedCronJobInterface[] = [];
  api;
  db;
  settings;

  status: string;
  debug = false;

  MICROSECDONDS_PER_CM = 1e6 / 34321; // The number of microseconds it takes sound to travel 1cm at 20 degrees celcius

  triggerPin: number;
  echoPin: number;

  constructor(id: number, triggerPin: number, echoPin: number) {
    this.id = id;
    this.triggerPin = triggerPin;
    this.echoPin = echoPin;
  }

  async setup() {
    this.serialNumber = await this.settings.getSerialNumber();
    this.setSchedule();
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
        operatingMode: operatingMode!,
        systemOperatingMode: systemOperatingMode,
        serialNumber: this.serialNumber.sn,
      };
      await this.db.logItem("probes_log", job);
    }
  }

  async READ() {
    return new Promise((resolve) => {
      const trigger = new Gpio(this.triggerPin, { mode: Gpio.OUTPUT });
      const echo = new Gpio(this.echoPin, { mode: Gpio.INPUT, alert: true });
      trigger.digitalWrite(0); // Make sure trigger is low
      const watchHCSR04 = () => {
        let startTick;
        echo.on("alert", (level, tick) => {
          if (level == 1) {
            startTick = tick;
          } else {
            const endTick = tick;
            const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
            console.log(diff / 2 / this.MICROSECDONDS_PER_CM);
            resolve("water level result");
          }
        });
      };

      watchHCSR04();
      setInterval(() => {
        trigger.trigger(10, 1); // Set trigger high for 10 microseconds
      }, 1000);
    });
  }

  async setSchedule() {
    if (this.id && this.scheduledCrons) {
      const scheduleArr: CronJobInterface[] = [];
      this.scheduledCrons.map((probeScheduleRow) => {
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
export default WaterLevelComponent;
