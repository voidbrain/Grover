// import i2cBus from 'i2c-bus';


import { CronJobInterface } from '../../../interfaces/cron-job';
import { Owner, Peripherals, ServerCommands } from '../../../services/settings/enums';

import RoomWaterRefillComponent from '../room-water-refill/room-water-refill';

import schedule from 'node-schedule';
import moment from 'moment';

class WaterRefillComponent {
  id: number;
  parentId: number;
  parentName: string;
  i2cAddress: string; 
  pin1: number; 
  pin2: number;
  primaryPump: RoomWaterRefillComponent;
  secondaryPump;

  serialNumber: { sn: string, found: boolean };
  
  scheduledCrons: any[] = []; 
  api;
  settings;
  db;

  status: string;

  constructor(primaryPump: RoomWaterRefillComponent, parentId: number, parentName: string, id: number, i2cAddress: number, pin1: number, pin2:number, scheduleArr, db, api, settings) {
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
    this.primaryPump = primaryPump;
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
      });
      this.setSchedule(this.id, this.scheduledCrons);
    } else {
      console.log('[WATER-REFILL]: EXIT on --> Raspberry OR i2c Address not found');
    }
  }

  async setStatus(){
    this.status = null;
  }

  async delay (seconds) {
    return new Promise<void>(resolve => {
      return setTimeout(() => {
        resolve();
      }, seconds*1000);
    });
  }

  async forward () {
    return new Promise<void>(resolve => {
      this.secondaryPump.digitalWrite(this.pin1, this.secondaryPump.HIGH);
      this.secondaryPump.digitalWrite(this.pin2, this.secondaryPump.LOW);
      resolve();
    });
  };

  async backward () {
    return new Promise<void>(resolve => {
      this.secondaryPump.digitalWrite(this.pin1, this.secondaryPump.LOW);
      this.secondaryPump.digitalWrite(this.pin2, this.secondaryPump.HIGH);
      resolve();
    });
  };

  async stop () {
    return new Promise<void>(resolve => {
      this.secondaryPump.digitalWrite(this.pin1, this.secondaryPump.LOW);
      this.secondaryPump.digitalWrite(this.pin2, this.secondaryPump.LOW);
      resolve();
    });
  };
  
  public async RUN({expectedTime, owner, operatingMode}) {
    const self = this;
    return new Promise(async (resolve) => {
      const systemOperatingMode = self.settings.getOperatingMode();
      if(operatingMode >= systemOperatingMode) {
        await self.primaryPump.forward();
        await self.primaryPump.delay(2000);
        await self.primaryPump.stop();
        await self.delay(2000);
        await self.forward();
        await self.delay(2000);
        await self.stop();

        const job = {
          owner, 
          action: ServerCommands.RUN,
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
            console.log("[WATER-REFILL]: RUN manual", job);
            if (self.settings.getLogMode() === true) { 
              await self.db.logItem('workers_log', job); 
              resolve(job);
            }
          break;
          case Owner.schedule: // scheduled action
            console.log("[WATER-REFILL]: RUN scheduled", job);
            if (self.settings.getLogMode() === true) { 
              await self.db.logItem('workers_log', job); 
              resolve;
            }
          break;
        };
      } else {
        console.log(`[WATER-REFILL]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`);
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
export default WaterRefillComponent
