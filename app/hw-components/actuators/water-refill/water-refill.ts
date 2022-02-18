// import i2cBus from 'i2c-bus';


import { CronJobInterface } from '../../../interfaces/cron-job';
import { Owner } from '../../../services/settings/enums';

import schedule from 'node-schedule';
import moment from 'moment';
class WaterRefillComponent {
  id: number;
  
  i2cAddress: string; 
  pin1: number; 
  pin2: number;
  
  scheduledCrons: any[] = []; 
  api;
  settings;
  db;
  mcp;

  constructor(id: number, i2cAddress: number, pin1: number, pin2:number, scheduleArr, db, api, settings) {
    this.id = id;
    this.i2cAddress = i2cAddress.toString(16);
    this.pin1 = pin1;
    this.pin2 = pin2;
    this.api = api;
    this.db = db;
    this.settings = settings;
    this.scheduledCrons = scheduleArr;
    this.setSchedule(this.id, this.scheduledCrons);
    this.setup();
  }

  async setup(){
    const self = this;
    if((await self.settings.getSerialNumber()).found) {
      const MCP23017 = await import('node-mcp23017');
      this.mcp = new MCP23017({
        address: self.i2cAddress,
        device: 1,
        debug: true
      });
      this.mcp.pinMode(this.pin1, this.mcp.OUTPUT);
      this.mcp.pinMode(this.pin2, this.mcp.OUTPUT);
    } else {
      console.log('[WATER-REFILL]: EXIT on --> Raspberry not found');
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
          id: self.id, 
          expectedTime: moment(expectedTime), 
          executedTime: moment(),
          operatingMode: operatingMode,
          systemOperatingMode: systemOperatingMode,
        };
            
        switch(owner){
          case Owner.user: // manual action
            console.log("[WATER-REFILL]: RUN manual", job);
            await self.db.putItem('probes_list', job);
            resolve(job);
          break;
          case Owner.schedule: // scheduled action
            console.log("[WATER-REFILL]: RUN scheduled", job);
            await self.db.putItem('probes_list', job);
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
