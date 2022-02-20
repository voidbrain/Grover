// import i2cBus from 'i2c-bus';


import { CronJobInterface } from '../../../interfaces/cron-job';
import { Owner, Peripherals } from '../../../services/settings/enums';

import schedule from 'node-schedule';
import moment from 'moment';
class WaterRefillComponent {
  id: number;
  parentId: number;
  parentName: string;
  i2cAddress: string; 
  pin1: number; 
  pin2: number;

  serialNumber: { sn: string, found: boolean };
  
  scheduledCrons: any[] = []; 
  api;
  settings;
  db;
  mcp;

  constructor(parentId: number, parentName: string, id: number, i2cAddress: number, pin1: number, pin2:number, scheduleArr, db, api, settings) {
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
    this.setup();
  }

  async setup(){
    const self = this;
    self.serialNumber = await self.settings.getSerialNumber();
    if(self.serialNumber.found && +self.i2cAddress) {
      import('node-mcp23017').then(({default: MCP23017}) => {
        this.mcp = new MCP23017({
          address: +self.i2cAddress,
          debug: false
        });
        this.mcp.pinMode(this.pin1, this.mcp.OUTPUT);
        this.mcp.pinMode(this.pin2, this.mcp.OUTPUT);
      });
      this.setSchedule(this.id, this.scheduledCrons);
    } else {
      console.log('[WATER-REFILL]: EXIT on --> Raspberry OR i2c Address not found');
    }
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
      this.mcp.digitalWrite(this.pin1, this.mcp.HIGH);
      this.mcp.digitalWrite(this.pin2, this.mcp.LOW);
      resolve();
    });
  };

  async backward () {
    return new Promise<void>(resolve => {
      this.mcp.digitalWrite(this.pin1, this.mcp.LOW);
      this.mcp.digitalWrite(this.pin2, this.mcp.HIGH);
      resolve();
    });
  };

  async stop () {
    return new Promise<void>(resolve => {
      this.mcp.digitalWrite(this.pin1, this.mcp.LOW);
      this.mcp.digitalWrite(this.pin2, this.mcp.LOW);
      resolve();
    });
  };

  public async RUN({expectedTime, owner, operatingMode}) {
    const self = this;
    return new Promise(async (resolve) => {
      const systemOperatingMode = self.settings.getOperatingMode();
      if(operatingMode >= systemOperatingMode) {
        // await this.forward();
        // await this.delay(2000);
        // await this.stop();

        const job = {
          owner, 
          action: 'RUN',
          idWorker: self.id, 
          parentId: self.parentId, 
          parentName: self.parentName, 
          type: Peripherals.Worker,
          expectedTime: new Date(expectedTime), 
          executedTime: new Date,
          operatingMode: operatingMode,
          systemOperatingMode: systemOperatingMode,
          serialNumber: self.serialNumber.sn,
        };
            
        switch(owner){
          case Owner.user: // manual action
            console.log("[WATER-REFILL]: RUN manual", job);
            await self.db.logItem('workers_log', job);
            resolve(job);
          break;
          case Owner.schedule: // scheduled action
            console.log("[WATER-REFILL]: RUN scheduled", job);
            await self.db.logItem('workers_log', job);
            resolve;
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
