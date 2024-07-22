import { CronJobInterface } from "../../../interfaces/cron-job";
import {
  Owner,
  DevicesStatus,
  ServerCommands,
  Peripherals,
} from "../../../services/settings/enums";

import schedule from "node-schedule";
import moment from "moment";
class EcProbeComponent {
  triggerPin: number;
  echoPin: number;

  id: number;
  parentId: number;
  parentName: string;
  serialNumber: { sn: string; found: boolean };

  scheduledCrons: any[] = [];
  api;
  db;
  settings;

  debug = false;
  status: string;

  constructor(triggerPin: number, echoPin: number) {
    triggerPin = triggerPin;
    echoPin = echoPin;
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
        console.log("[FAN-MOTOR]: status", self.status);
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
    return new Promise((resolve) => {
      // sensor.get(self.id, function (err, tempObj) {
      //  if (err) { throw err; }
      //  resolve({id: self.id, value: tempObj});
      //  });
      resolve;
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
export default EcProbeComponent;
