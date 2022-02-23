// import i2cBus from 'i2c-bus';


import { CronJobInterface } from '../../../interfaces/cron-job';
import { Owner, Peripherals, ServerCommands } from '../../../services/settings/enums';

import RoomWaterRefillComponent from '../room-water-refill/room-water-refill';
import RoomPhDownRefillComponent from '../room-phdown-refill/room-phdown-refill';
import RoomNutrientRefillComponent from '../room-nutrient-refill/room-nutrient-refill';

import schedule from 'node-schedule';
import moment from 'moment';

class RefillComponent {
  phase: any;
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

  serialNumber: { sn: string, found: boolean };
  
  scheduledCrons: any[] = []; 
  api;
  settings;
  db;

  status: string;

  delayAfterPumpRun = 1000; // millisec
  delayTimeToMl = 1000; // millisec to move a ml, primary
  waterToPotTime = 30; // sec to move to the pot, secondary

  constructor(phase: any, primaryWaterPump: RoomWaterRefillComponent, primaryPhDownPump: RoomPhDownRefillComponent, primaryNutrientPump: RoomNutrientRefillComponent, 
    parentId: number, parentName: string, id: number, i2cAddress: number, pin1: number, pin2:number, scheduleArr, db, api, settings) {
    this.phase = phase;
    this.id = id;
    this.parentId = parentId;
    this.parentName = parentName;
    this.i2cAddress =  '0x'+parseInt(i2cAddress.toString(10)).toString(16);
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

  async setup(){
    const self = this;
    self.serialNumber = await self.settings.getSerialNumber();
    if(self.serialNumber.found && +self.i2cAddress) {
      import('node-mcp23017').then(({default: MCP23017}) => {
        this.secondaryPump = new MCP23017({
          address: +self.i2cAddress,
          device: 1,
          debug: false
        });
        this.secondaryPump.pinMode(this.pin1, this.secondaryPump.OUTPUT);
        this.secondaryPump.pinMode(this.pin2, this.secondaryPump.OUTPUT);

        this.secondaryPump.pinMode(this.primaryWaterPump.pin1, this.secondaryPump.OUTPUT);
        this.secondaryPump.pinMode(this.primaryWaterPump.pin2, this.secondaryPump.OUTPUT);

        // this.secondaryPump.pinMode(this.primaryPhDownPump.pin1, this.secondaryPump.OUTPUT);
        // this.secondaryPump.pinMode(this.primaryPhDownPump.pin2, this.secondaryPump.OUTPUT);

        // this.secondaryPump.pinMode(this.primaryNutrientPump.primaryNutrientPumpGro.pin1, this.secondaryPump.OUTPUT);
        // this.secondaryPump.pinMode(this.primaryNutrientPump.primaryNutrientPumpGro.pin2, this.secondaryPump.OUTPUT);

        // this.secondaryPump.pinMode(this.primaryNutrientPump.primaryNutrientPumpMicro.pin1, this.secondaryPump.OUTPUT);
        // this.secondaryPump.pinMode(this.primaryNutrientPump.primaryNutrientPumpMicro.pin2, this.secondaryPump.OUTPUT);

        // this.secondaryPump.pinMode(this.primaryNutrientPump.primaryNutrientPumpBloom.pin1, this.secondaryPump.OUTPUT);
        // this.secondaryPump.pinMode(this.primaryNutrientPump.primaryNutrientPumpBloom.pin2, this.secondaryPump.OUTPUT);

        // this.secondaryPump.pinMode(this.primaryNutrientPump.primaryNutrientPumpRipen.pin1, this.secondaryPump.OUTPUT);
        // this.secondaryPump.pinMode(this.primaryNutrientPump.primaryNutrientPumpRipen.pin2, this.secondaryPump.OUTPUT);

      });
      this.setSchedule(this.id, this.scheduledCrons);
    } else {
      console.log('[POT-REFILL]: EXIT on --> Raspberry OR i2c Address not found');
    }
  }

  async setStatus(){
    this.status = null;
  }

  async delay (milliseconds) {
    return new Promise(resolve => {
      return setTimeout(() => {
        resolve(true);
      }, milliseconds);
    });
  }

  async forward () {
    return new Promise(resolve => {
      this.secondaryPump.digitalWrite(this.pin1, this.secondaryPump.HIGH);
      this.secondaryPump.digitalWrite(this.pin2, this.secondaryPump.LOW);
      resolve(true);
    });
  };

  async backward () {
    return new Promise(resolve => {
      this.secondaryPump.digitalWrite(this.pin1, this.secondaryPump.LOW);
      this.secondaryPump.digitalWrite(this.pin2, this.secondaryPump.HIGH);
      resolve(true);
    });
  };

  async stop () {
    return new Promise(resolve => {
      this.secondaryPump.digitalWrite(this.pin1, this.secondaryPump.LOW);
      this.secondaryPump.digitalWrite(this.pin2, this.secondaryPump.LOW);
      resolve(true);
    });
  };

  async delayTest (milliseconds) {
    return new Promise(resolve => {
      return setTimeout(() => {
        resolve(true);
      }, milliseconds);
    });
  }

  async forwardTest (pin1, pin2) {
    return new Promise(resolve => {
      this.secondaryPump.digitalWrite(pin1, this.secondaryPump.HIGH);
      this.secondaryPump.digitalWrite(pin2, this.secondaryPump.LOW);
      resolve(true);
    });
  };

  async backwardTest (pin1, pin2) {
    return new Promise(resolve => {
      this.secondaryPump.digitalWrite(pin1, this.secondaryPump.LOW);
      this.secondaryPump.digitalWrite(pin2, this.secondaryPump.HIGH);
      resolve(true);
    });
  };

  async stopTest (pin1, pin2) {
    return new Promise(resolve => {
      this.secondaryPump.digitalWrite(pin1, this.secondaryPump.LOW);
      this.secondaryPump.digitalWrite(pin2, this.secondaryPump.LOW);
      resolve(true);
    });
  };
  
  public async RUN_WATER({expectedTime, owner, operatingMode}) {
    const self = this;
    return new Promise(async (resolve) => {
      const systemOperatingMode = self.settings.getOperatingMode();
      if(operatingMode >= systemOperatingMode) {
        const waterMl = self.phase.dose.water;

        await self.primaryWaterPump.forward();
        await self.primaryWaterPump.delay(self.delayTimeToMl*waterMl);
        await self.primaryWaterPump.stop();

        await self.delay(self.delayTimeToMl*self.waterToPotTime);
        await self.forward();
        await self.delay(self.delayAfterPumpRun);
        await self.stop();

        const job = {
          owner, 
          action: ServerCommands.RUN_WATER,
          idWorker: self.id, 
          parentId: self.parentId, 
          parentName: self.parentName, 
          type: Peripherals.Worker,
          expectedTime: (expectedTime ? new Date(expectedTime) : null), 
          executedTime: new Date,
          operatingMode: operatingMode,
          systemOperatingMode: systemOperatingMode,
          serialNumber: self.serialNumber.sn,
        };
            
        switch(owner){
          case Owner.user: // manual action
            console.log("[POT-REFILL]: RUN_WATER manual", job);
            if (self.settings.getLogMode() === true) { 
              await self.db.logItem('workers_log', job); 
              resolve(job);
            }
          break;
          case Owner.schedule: // scheduled action
            console.log("[POT-REFILL]: RUN_WATER scheduled", job);
            if (self.settings.getLogMode() === true) { 
              await self.db.logItem('workers_log', job); 
              resolve;
            }
          break;
        };
      } else {
        console.log(`[POT-REFILL]: RUN_WATER operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`);
      }
    });
  }

  public async RUN_WATER_TEST({expectedTime, owner, operatingMode}) {
    const self = this;
    return new Promise(async (resolve) => {
      const systemOperatingMode = self.settings.getOperatingMode();
      const slave = true;
      if(operatingMode >= systemOperatingMode) {
        const delay = 2000;

        console.log('start 1');

        // console.log(self.primaryWaterPump)

        await self.primaryWaterPump.forward();
        await self.primaryWaterPump.delay(delay);
        await self.primaryWaterPump.stop();
        
        console.log('start 2');
        await self.delay(delay);
        await self.forward();
        await self.delay(delay);
        await self.stop();
        console.log('end 2');

        const job = {
          owner, 
          action: ServerCommands.RUN_WATER_TEST,
          idWorker: self.id, 
          parentId: self.parentId, 
          parentName: self.parentName, 
          type: Peripherals.Worker,
          expectedTime: (expectedTime ? new Date(expectedTime) : null), 
          executedTime: new Date,
          operatingMode: operatingMode,
          systemOperatingMode: systemOperatingMode,
          serialNumber: self.serialNumber.sn,
        };
            
        switch(owner){
          case Owner.user: // manual action
            console.log("[POT-REFILL]: RUN_WATER_TEST manual", job);
            if (self.settings.getLogMode() === true) { 
              await self.db.logItem('workers_log', job); 
              resolve(job);
            }
          break;
          case Owner.schedule: // scheduled action
            console.log("[POT-REFILL]: RUN_WATER_TEST scheduled", job);
            if (self.settings.getLogMode() === true) { 
              await self.db.logItem('workers_log', job); 
              resolve;
            }
          break;
        };
      } else {
        console.log(`[POT-REFILL]: RUN_WATER_TEST operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`);
      }
    });
  }

  public async RUN_SINGLE_TEST({expectedTime, owner, operatingMode}) {
    const self = this;
    return new Promise(async (resolve) => {
      const systemOperatingMode = self.settings.getOperatingMode();
      const slave = true;
      if(operatingMode >= systemOperatingMode) {
        const delay = 2000;

        console.log('start 1');

        // console.log(self.primaryWaterPump)

        await self.delay(delay);
        await self.forward();
        await self.delay(delay);
        await self.stop();
        
        const job = {
          owner, 
          action: ServerCommands.RUN_SINGLE_TEST,
          idWorker: self.id, 
          parentId: self.parentId, 
          parentName: self.parentName, 
          type: Peripherals.Worker,
          expectedTime: (expectedTime ? new Date(expectedTime) : null), 
          executedTime: new Date,
          operatingMode: operatingMode,
          systemOperatingMode: systemOperatingMode,
          serialNumber: self.serialNumber.sn,
        };
            
        switch(owner){
          case Owner.user: // manual action
            console.log("[POT-REFILL]: RUN_SINGLE_TEST manual", job);
            if (self.settings.getLogMode() === true) { 
              await self.db.logItem('workers_log', job); 
              resolve(job);
            }
          break;
          case Owner.schedule: // scheduled action
            console.log("[POT-REFILL]: RUN_SINGLE_TEST scheduled", job);
            if (self.settings.getLogMode() === true) { 
              await self.db.logItem('workers_log', job); 
              resolve;
            }
          break;
        };
      } else {
        console.log(`[POT-REFILL]: RUN_SINGLE_TEST operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`);
      }
    });
  }

  public async RUN_DOSE({expectedTime, owner, operatingMode}) {
    const self = this;
    return new Promise(async (resolve) => {
      const systemOperatingMode = self.settings.getOperatingMode();
      if(operatingMode >= systemOperatingMode) {

        const groMl = self.phase.dose.gro;
        const microMl = self.phase.dose.micro;
        const bloomMl = self.phase.dose.bloom;
        const ripenMl = self.phase.dose.ripen;

        if(groMl) {
          await self.primaryWaterPump.forward();
          await self.primaryWaterPump.delay(self.delayTimeToMl*groMl);
          await self.primaryWaterPump.stop();
          await self.primaryWaterPump.delay(self.delayAfterPumpRun);
        }
        if(microMl) {
          await self.primaryWaterPump.forward();
          await self.primaryWaterPump.delay(self.delayTimeToMl*microMl);
          await self.primaryWaterPump.stop();
          await self.primaryWaterPump.delay(self.delayAfterPumpRun);
        }
        if(bloomMl) {
          await self.primaryWaterPump.forward();
          await self.primaryWaterPump.delay(self.delayTimeToMl*bloomMl);
          await self.primaryWaterPump.stop();
          await self.primaryWaterPump.delay(self.delayAfterPumpRun);
        }
        if(ripenMl) {
          await self.primaryWaterPump.forward();
          await self.primaryWaterPump.delay(self.delayTimeToMl*ripenMl);
          await self.primaryWaterPump.stop();
          await self.primaryWaterPump.delay(self.delayAfterPumpRun);
        }

        await self.delay(self.delayTimeToMl*self.waterToPotTime);
        await self.forward();
        await self.delay(self.delayAfterPumpRun);
        await self.stop();

        const job = {
          owner, 
          action: ServerCommands.RUN_DOSE,
          idWorker: self.id, 
          parentId: self.parentId, 
          parentName: self.parentName, 
          type: Peripherals.Worker,
          expectedTime: (expectedTime ? new Date(expectedTime) : null), 
          executedTime: new Date,
          operatingMode: operatingMode,
          systemOperatingMode: systemOperatingMode,
          serialNumber: self.serialNumber.sn,
        };
            
        switch(owner){
          case Owner.user: // manual action
            console.log("[POT-REFILL]: RUN_DOSE manual", job);
            if (self.settings.getLogMode() === true) { 
              await self.db.logItem('workers_log', job); 
              resolve(job);
            }
          break;
          case Owner.schedule: // scheduled action
            console.log("[POT-REFILL]: RUN_DOSE scheduled", job);
            if (self.settings.getLogMode() === true) { 
              await self.db.logItem('workers_log', job); 
              resolve;
            }
          break;
        };
      } else {
        console.log(`[POT-REFILL]: RUN_DOSE operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`);
      }
    });
  }

  public async RUN_PHDOWN({ 
    // groMl, microMl, bloomMl, ripenMl, 
    expectedTime, owner, operatingMode}) {
    const self = this;
    return new Promise(async (resolve) => {
      const systemOperatingMode = self.settings.getOperatingMode();
      if(operatingMode >= systemOperatingMode) {

        const pHDown = self.phase.dose.pHDown;

        if(pHDown) {
          await self.primaryWaterPump.forward();
          await self.primaryWaterPump.delay(self.delayTimeToMl*pHDown);
          await self.primaryWaterPump.stop();
          await self.primaryWaterPump.delay(self.delayAfterPumpRun);
        }

        await self.delay(self.delayTimeToMl*self.waterToPotTime);
        await self.forward();
        await self.delay(self.delayAfterPumpRun);
        await self.stop();

        const job = {
          owner, 
          action: ServerCommands.RUN_PHDOWN,
          idWorker: self.id, 
          parentId: self.parentId, 
          parentName: self.parentName, 
          type: Peripherals.Worker,
          expectedTime: (expectedTime ? new Date(expectedTime) : null), 
          executedTime: new Date,
          operatingMode: operatingMode,
          systemOperatingMode: systemOperatingMode,
          serialNumber: self.serialNumber.sn,
        };
            
        switch(owner){
          case Owner.user: // manual action
            console.log("[POT-REFILL]: RUN_PHDOWN manual", job);
            if (self.settings.getLogMode() === true) { 
              await self.db.logItem('workers_log', job); 
              resolve(job);
            }
          break;
          case Owner.schedule: // scheduled action
            console.log("[POT-REFILL]: RUN_PHDOWN scheduled", job);
            if (self.settings.getLogMode() === true) { 
              await self.db.logItem('workers_log', job); 
              resolve;
            }
          break;
        };
      } else {
        console.log(`[POT-REFILL]: RUN_PHDOWN operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`);
      }
    });
  }

  async setSchedule(id: number, scheduledCrons: any[]){
    const self = this;
    if(id && scheduledCrons) {
      const scheduleArr: CronJobInterface[] = [];
      scheduledCrons.map(probeScheduleRow => {
        const scheduleRow:CronJobInterface = { 
          action: probeScheduleRow.action, 
          cron: `${probeScheduleRow.atMinute} ${probeScheduleRow.atHour} * * ${probeScheduleRow.atDay}`,
          operatingMode: probeScheduleRow.operatingMode,
        };
        scheduleArr.push(scheduleRow);
      });
      
      scheduleArr.map(job => {
        schedule.scheduleJob(job.cron, async (expectedTime) => {
          const owner = Owner.schedule;
          const doJob = await eval(
            `this.${job.action}({
              expectedTime: '${expectedTime}', 
              owner: '${owner}', 
              operatingMode: ${job.operatingMode}
            })`);
        })
      });
    }
  }

}
export default RefillComponent
