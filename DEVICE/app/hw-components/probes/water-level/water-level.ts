import { CronJobInterface } from "../../../interfaces/cron-job";
import {
  Owner,
  Peripherals,
  ServerCommands,
  DevicesStatus,
} from "../../../services/settings/enums";

import schedule from "node-schedule";
import moment from "moment";
import { Gpio } from 'pigpio';

class WaterLevelComponent {
  id: number;
  parentId: number;
  parentName: string;
  address: string;

  serialNumber: { sn: string; found: boolean };

  scheduledCrons: any[] = [];
  api;
  db;
  settings;

  status: string;
  debug = false;

  MICROSECDONDS_PER_CM = 1e6/34321; // The number of microseconds it takes sound to travel 1cm at 20 degrees celcius


  triggerPin: number;
  echoPin: number;
  
  constructor(id: number, triggerPin: number, echoPin: number) {
    this.id = id;
    this.triggerPin = triggerPin;
    this.echoPin = echoPin;
  }

  async setup() {
    const self = this;
    self.serialNumber = await self.settings.getSerialNumber();
    if (self.serialNumber.found) {
      this.setSchedule();
    } else {
      console.log(
        "[TEMPERATURE]: EXIT on --> Raspberry OR i2c Address not found"
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
        console.log("[TEMPERATURE]: status", self.status);
      }
      const systemOperatingMode = self.settings.getOperatingMode();
      const expectedTime = null;
      const job = {
        owner,
        action: ServerCommands.SET_STATUS,
        idProbe: self.id,
        parentId: self.parentId,
        parentName: self.parentName,
        type: Peripherals.Probe,
        expectedTime,
        executedTime: new Date(),
        operatingMode: operatingMode,
        systemOperatingMode: systemOperatingMode,
        serialNumber: self.serialNumber.sn,
      };
      await self.db.logItem("probes_log", job);
    }
  }

  async READ() {
    const self = this;
    return new Promise(resolve => {
      const trigger = new Gpio(self.triggerPin, {mode: Gpio.OUTPUT});
      const echo = new Gpio(self.echoPin, {mode: Gpio.INPUT, alert: true});
      trigger.digitalWrite(0); // Make sure trigger is low
      const watchHCSR04 = () => {
        let startTick;
        echo.on('alert', (level, tick) => {
          if (level == 1) {
            startTick = tick;
          } else {
            const endTick = tick;
            const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
            console.log(diff / 2 / self.MICROSECDONDS_PER_CM);
            resolve('water level result');
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
export default WaterLevelComponent;
