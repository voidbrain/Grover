// import i2cBus from 'i2c-bus';

import { CronJobInterface } from "../../../interfaces/cron-job";
import {
  Owner,
  Peripherals,
  ServerCommands,
  DevicesStatus,
} from "../../../services/settings/enums";

import schedule from "node-schedule";
import moment from "moment";

class RoomNutrientRefillComponent {
  id: number;
  parentId: number;
  parentName: string;
  // i2cAddressGro: string;
  // i2cAddressMicro: string;
  // i2cAddressBloom: string;
  // i2cAddressRipen: string;
  // pin1Gro: number;
  // pin2Gro: number;
  // pin1Micro: number;
  // pin2Micro: number;
  // pin1Bloom: number;
  // pin2Bloom: number;
  // pin1Ripen: number;
  // pin2Ripen: number;
  primaryNutrientPumpGro;
  primaryNutrientPumpMicro;
  primaryNutrientPumpBloom;
  primaryNutrientPumpRipen;

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
    // i2cAddressGro: number, pin1Gro: number, pin2Gro: number,
    // i2cAddressMicro: number, pin1Micro: number, pin2Micro: number,
    // i2cAddressBloom: number, pin1Bloom: number, pin2Bloom: number,
    // i2cAddressRipen: number, pin1Ripen: number, pin2Ripen: number,
    primaryNutrientPumpGro,
    primaryNutrientPumpMicro,
    primaryNutrientPumpBloom,
    primaryNutrientPumpRipen,

    scheduleArr,
    db,
    api,
    settings
  ) {
    this.id = id;
    this.parentId = parentId;
    this.parentName = parentName;
    // this.i2cAddressGro =  '0x'+parseInt(i2cAddressGro.toString(10)).toString(16);
    // this.pin1Gro = +pin1Gro;
    // this.pin2Gro = +pin2Gro;
    // this.i2cAddressMicro =  '0x'+parseInt(i2cAddressMicro.toString(10)).toString(16);
    // this.pin1Micro = +pin1Micro;
    // this.pin2Micro = +pin2Micro;
    // this.i2cAddressBloom =  '0x'+parseInt(i2cAddressBloom.toString(10)).toString(16);
    // this.pin1Bloom = +pin1Bloom;
    // this.pin2Bloom = +pin2Bloom;
    // this.i2cAddressRipen =  '0x'+parseInt(i2cAddressRipen.toString(10)).toString(16);
    // this.pin1Ripen = +pin1Ripen;
    // this.pin2Ripen = +pin2Ripen;
    (this.primaryNutrientPumpGro = primaryNutrientPumpGro),
      (this.primaryNutrientPumpMicro = primaryNutrientPumpMicro),
      (this.primaryNutrientPumpBloom = primaryNutrientPumpBloom),
      (this.primaryNutrientPumpRipen = primaryNutrientPumpRipen),
      (this.api = api);
    this.db = db;
    this.settings = settings;
    this.scheduledCrons = scheduleArr;
  }

  async setup() {
    const self = this;
    self.serialNumber = await self.settings.getSerialNumber();
    // if(self.serialNumber.found && +self.i2cAddressGro && +self.i2cAddressMicro && +self.i2cAddressBloom && +self.i2cAddressRipen) {
    //   import('node-mcp23017').then(({default: MCP23017}) => {
    //     this.primaryNutrientPumpGro = new MCP23017({ address: +self.i2cAddressGro, device: 1, debug: false });
    //     this.primaryNutrientPumpGro.pinMode(this.pin1Gro, this.primaryNutrientPumpGro.OUTPUT);
    //     this.primaryNutrientPumpGro.pinMode(this.pin2Gro, this.primaryNutrientPumpGro.OUTPUT);
    //     this.primaryNutrientPumpMicro = new MCP23017({ address: +self.i2cAddressMicro, device: 1, debug: false });
    //     this.primaryNutrientPumpMicro.pinMode(this.pin1Micro, this.primaryNutrientPumpMicro.OUTPUT);
    //     this.primaryNutrientPumpMicro.pinMode(this.pin2Micro, this.primaryNutrientPumpMicro.OUTPUT);
    //     this.primaryNutrientPumpBloom = new MCP23017({ address: +self.i2cAddressBloom, device: 1, debug: false });
    //     this.primaryNutrientPumpBloom.pinMode(this.pin1Bloom, this.primaryNutrientPumpBloom.OUTPUT);
    //     this.primaryNutrientPumpBloom.pinMode(this.pin2Bloom, this.primaryNutrientPumpBloom.OUTPUT);
    //     this.primaryNutrientPumpRipen = new MCP23017({ address: +self.i2cAddressRipen, device: 1, debug: false });
    //     this.primaryNutrientPumpRipen.pinMode(this.pin1Ripen, this.primaryNutrientPumpRipen.OUTPUT);
    //     this.primaryNutrientPumpRipen.pinMode(this.pin2Ripen, this.primaryNutrientPumpRipen.OUTPUT);
    //   });
    //   this.setSchedule(this.id, this.scheduledCrons);
    // } else {
    //   if( this.debug) {  console.log('[ROOM-Nutrient-REFILL]: EXIT on --> Raspberry OR i2c Address not found');}
    // }
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
        console.log("[ROOM-Nutrient-REFILL]: status", self.status);
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

  public async forward(pump) {
    const self = this;
    if (this.debug) {
      console.log(`[ROOM-Nutrient-REFILL]: forward ${pump}`);
    }
    await self[pump].forward();

    // return new Promise((resolve, reject) => {
    //   this[`primaryNutrientPump${pump}`].digitalWrite(this[`pin1${pump}`], this[`primaryNutrientPump${pump}`].HIGH);
    //   this[`primaryNutrientPump${pump}`].digitalWrite(this[`pin2${pump}`], this[`primaryNutrientPump${pump}`].LOW);
    //   resolve(true);
    // })
  }

  public async backward(pump) {
    const self = this;
    if (this.debug) {
      console.log(`[ROOM-Nutrient-REFILL]: forward ${pump}`);
    }
    await self[pump].backward();
  }

  public async stop(pump) {
    const self = this;
    if (this.debug) {
      console.log(`[ROOM-Nutrient-REFILL]: forward ${pump}`);
    }
    await self[pump].stop();
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
export default RoomNutrientRefillComponent;
