// import i2cBus from 'i2c-bus';

import { CronJobInterface, ExtendedCronJobInterface } from "../../../interfaces/cron-job";
import {
  EventEmitter,
  Peripherals,
  ServerCommands,
  DevicesStatus,
} from "../../../services/settings/enums";
import { Phase } from "../../../interfaces/phase";

import RoomWaterRefillComponent from "../room-water-refill/room-water-refill";
import RoomPhDownRefillComponent from "../room-phdown-refill/room-phdown-refill";
import RoomNutrientRefillComponent from "../room-nutrient-refill/room-nutrient-refill";

import schedule from "node-schedule";
import moment from "moment";

class RefillComponent {
  phase: Phase;
  id: number;
  parentId: number;
  parentName: string;
  i2cAddress: string;
  pin1: number;
  pin2: number;
  primaryWaterPump: RoomWaterRefillComponent;
  primaryPhDownPump: RoomPhDownRefillComponent;
  primaryNutrientPump: RoomNutrientRefillComponent;
  secondaryPump;

  serialNumber: { sn: string; found: boolean };

  scheduledCrons: ExtendedCronJobInterface[] = [];
  api;
  settings;
  db;

  status: string;

  delayAfterPumpRun = 1000; // millisec
  waterToPotTime = 1000;
  debug = false;

  constructor(
    phase: Phase,
    primaryWaterPump: RoomWaterRefillComponent,
    primaryPhDownPump: RoomPhDownRefillComponent,
    primaryNutrientPump: RoomNutrientRefillComponent,
    parentId: number,
    parentName: string,
    id: number,
    i2cAddress: number,
    pin1: number,
    pin2: number,
    scheduleArr,
    db,
    api,
    settings,
  ) {
    this.phase = phase;
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
    this.primaryWaterPump = primaryWaterPump;
    this.primaryPhDownPump = primaryPhDownPump;
    this.primaryNutrientPump = primaryNutrientPump;
  }

  async setup() {
      import("node-mcp23017").then(({ default: MCP23017 }) => {
        this.secondaryPump = new MCP23017({
          address: +this.i2cAddress,
          device: 1,
          debug: false,
        });
        this.secondaryPump.pinMode(this.pin1, this.secondaryPump.OUTPUT);
        this.secondaryPump.pinMode(this.pin2, this.secondaryPump.OUTPUT);

        this.secondaryPump.pinMode(
          this.primaryWaterPump.pin1,
          this.secondaryPump.OUTPUT,
        );
        this.secondaryPump.pinMode(
          this.primaryWaterPump.pin2,
          this.secondaryPump.OUTPUT,
        );
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
      self[this.status]({
        expectedTime: scheduledStart,
        eventEmitter,
        operatingMode: operatingMode!,
      });
    } else {
      // default off
      this.status = DevicesStatus.OFF;
      if (this.debug) {
        console.log("[POT-REFILL]: status", this.status);
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

  async delay(milliseconds) {
    return new Promise((resolve) => {
      return setTimeout(() => {
        resolve(true);
      }, milliseconds);
    });
  }

  async forward() {
    return new Promise((resolve) => {
      this.secondaryPump.digitalWrite(this.pin1, this.secondaryPump.HIGH);
      this.secondaryPump.digitalWrite(this.pin2, this.secondaryPump.LOW);
      resolve(true);
    });
  }

  async backward() {
    return new Promise((resolve) => {
      this.secondaryPump.digitalWrite(this.pin1, this.secondaryPump.LOW);
      this.secondaryPump.digitalWrite(this.pin2, this.secondaryPump.HIGH);
      resolve(true);
    });
  }

  async stop() {
    return new Promise((resolve) => {
      this.secondaryPump.digitalWrite(this.pin1, this.secondaryPump.LOW);
      this.secondaryPump.digitalWrite(this.pin2, this.secondaryPump.LOW);
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
  }): Promise<unknown> {
    try {
      const systemOperatingMode = this.settings.getOperatingMode();
  
      if (operatingMode < systemOperatingMode) {
        if (this.debug) {
          console.log(`[POT-REFILL]: RUN_WATER operatingMode insufficient level (probe: ${operatingMode}, system: ${systemOperatingMode})`);
        }
        return;
      }
  
      const waterMl = this.phase.dose.water;
  
      await this.primaryWaterPump.forward();
      await this.primaryWaterPump.delay(duration * waterMl);
      await this.primaryWaterPump.stop();
  
      await this.forward();
      await this.delay(this.waterToPotTime);
      await this.stop();
  
      const job = this.createJob(ServerCommands.RUN_WATER, eventEmitter, expectedTime);
      
      if (this.settings.getLogMode()) {
        await this.db.logItem("workers_log", job);
      }
  
      if (this.debug) {
        console.log(`[POT-REFILL]: RUN_WATER ${eventEmitter === EventEmitter.user ? 'manual' : 'scheduled'}`, job);
      }
  
      return job;
    } catch (error) {
      console.error("[POT-REFILL]: Error in RUN_WATER action", error);
      throw error;
    }
  }
  

  public async RUN_DOSE({
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
          console.log(`[POT-REFILL]: RUN_DOSE operatingMode insufficient level (probe: ${operatingMode}, system: ${systemOperatingMode})`);
        }
        return false;
      }
  
      const doses = {
        gro: this.phase.dose.grow,
        micro: this.phase.dose.micro,
        bloom: this.phase.dose.bloom,
        ripen: this.phase.dose.ripen
      };
  
      for (const [, ml] of Object.entries(doses)) {
        if (ml) {
          await this.primaryWaterPump.forward();
          await this.primaryWaterPump.delay(duration * ml);
          await this.primaryWaterPump.stop();
        }
      }
  
      await this.delay(this.waterToPotTime);
      await this.forward();
      await this.stop();
  
      const job = this.createJob(ServerCommands.RUN_DOSE, eventEmitter, expectedTime);
  
      if (this.settings.getLogMode()) {
        await this.db.logItem("workers_log", job);
      }
  
      if (this.debug) {
        console.log(`[POT-REFILL]: RUN_DOSE ${eventEmitter === EventEmitter.user ? 'manual' : 'scheduled'}`, job);
      }
  
      return true;
    } catch (error) {
      console.error("[POT-REFILL]: Error in RUN_DOSE action", error);
      throw error;
    }
  }
  

  public async RUN_PHDOWN({
    expectedTime,
    eventEmitter,
    operatingMode,
    duration,
  }: {
    expectedTime?: string;
    eventEmitter: EventEmitter;
    operatingMode: number;
    duration: number;
  }): Promise<unknown> {
    try {
      const systemOperatingMode = this.settings.getOperatingMode();
  
      if (operatingMode < systemOperatingMode) {
        if (this.debug) {
          console.log(`[POT-REFILL]: RUN_PHDOWN operatingMode insufficient level (probe: ${operatingMode}, system: ${systemOperatingMode})`);
        }
        return;
      }
  
      const pHDown = this.phase.dose.pHDown;
  
      if (pHDown) {
        await this.primaryWaterPump.forward();
        await this.primaryWaterPump.delay(duration * pHDown);
        await this.primaryWaterPump.stop();
      }
  
      await this.delay(this.waterToPotTime);
      await this.forward();
      await this.stop();
  
      const job = this.createJob(ServerCommands.RUN_PHDOWN, eventEmitter, expectedTime);
  
      if (this.settings.getLogMode()) {
        await this.db.logItem("workers_log", job);
      }
  
      if (this.debug) {
        console.log(`[POT-REFILL]: RUN_PHDOWN ${eventEmitter === EventEmitter.user ? 'manual' : 'scheduled'}`, job);
      }
  
      return job;
    } catch (error) {
      console.error("[POT-REFILL]: Error in RUN_PHDOWN action", error);
      throw error;
    }
  }

  private createJob(action: string, eventEmitter: EventEmitter, expectedTime?: string) {
    return {
      eventEmitter,
      action,
      idWorker: this.id,
      parentId: this.parentId,
      parentName: this.parentName,
      type: Peripherals.Worker,
      expectedTime: expectedTime ? new Date(expectedTime) : null,
      executedTime: new Date(),
      operatingMode: this.settings.getOperatingMode(),
      systemOperatingMode: this.settings.getOperatingMode(),
      serialNumber: this.serialNumber.sn,
    };
  }
  
  

  async setSchedule(id: number, scheduledCrons: ExtendedCronJobInterface[]) {
    
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
export default RefillComponent;
