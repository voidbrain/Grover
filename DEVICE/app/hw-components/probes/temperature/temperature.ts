import 'module-alias/register';
import { CronJobInterface } from "../../../interfaces/cron-job";
import {
  EventEmitter,
  Peripherals,
  ServerCommands,
  DevicesStatus,
} from "../../../services/settings/enums";


// import sensor from '../../../../mocks/ds18x20.cjs';

import isPi from 'detect-rpi';

let sensor;

if (isPi()) {
  const { default: ds18x20 } = await import('ds18x20');
  sensor = ds18x20;
} else {
  const { default: ds18x20Mock } = await import('../../../../mocks/ds18x20.cjs');
  sensor = ds18x20Mock;
}

console.log(isPi);


import schedule from "node-schedule";
import moment from "moment";
class TemperatureComponent {
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

  constructor(
    parentId: number,
    parentName: string,
    id: number,
    address: string,
    scheduleArr,
    db,
    api,
    settings
  ) {
    this.id = id;
    this.parentId = parentId;
    this.parentName = parentName;
    this.address = address;
    this.scheduledCrons = scheduleArr;
    this.settings = settings;
    this.api = api;
    this.db = db;
  }

  async setup() {
    const self = this;
    self.serialNumber = await self.settings.getSerialNumber();
    if (true) { // if (self.serialNumber.found) {
      this.setSchedule();
    } else {
      console.log(
        "[TEMPERATURE]: EXIT on --> Raspberry OR i2c Address not found"
      );
    }
  }

  async setStatus(eventEmitter) {
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
        eventEmitter,
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
        eventEmitter,
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

  public async READ({ expectedTime, eventEmitter, operatingMode }) {
    console.log("2",expectedTime, eventEmitter, operatingMode);
    // EXAMPLE: http://151.61.172.169:8084/actuators?action=READ&id=1&type=probe
    const self = this;
    return new Promise(async (resolve, reject) => {
      const systemOperatingMode = self.settings.getOperatingMode();
      if (operatingMode >= systemOperatingMode) {
        sensor.get(self.address, async function (err: any, value: any) {
          if (err) {
            if (self.debug) {
              console.log(`[TEMP]: READ ${eventEmitter}, error: ${err}`);
            }
            reject(err);
            // throw err;
          } else {
            const job = {
              eventEmitter,
              action: ServerCommands.READ,
              value,
              idProbe: self.id,
              parentId: self.parentId,
              parentName: self.parentName,
              type: Peripherals.Probe,
              address: self.address,
              expectedTime: expectedTime ? new Date(expectedTime) : null,
              executedTime: new Date(),
              operatingMode: operatingMode,
              systemOperatingMode: systemOperatingMode,
              serialNumber: self.serialNumber.sn,
            };
            console.log(eventEmitter)
            switch (eventEmitter) {
              case EventEmitter.user: // manual action
                if (self.debug) {
                  console.log("[TEMP]: READ manual", job);
                }
                if (self.settings.getLogMode() === true) {
                  await self.db.logItem("probes_log", job);
                  resolve(job);
                } else {
                  console.log("don't log ");
                }
                break;
              case EventEmitter.schedule: // scheduled action
                if (self.debug) {
                  console.log("[TEMP]: READ schedule", job);
                }
                if (self.settings.getLogMode() === true) {
                  await self.db.logItem("probes_log", job);
                  resolve;
                }
                break;
            }
          }
        });
      } else {
        if (self.debug) {
          console.log(
            `[TEMP]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`
          );
        }
      }
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
          const eventEmitter = EventEmitter.schedule;
          const doJob = await eval(
            `this.${job.action}({
              expectedTime: '${expectedTime}', 
              eventEmitter: '${eventEmitter}', 
              operatingMode: ${job.operatingMode}
            })`
          );
        });
      });
    }
  }
}

export default TemperatureComponent;
