import moment from "moment";


import { CronJobInterface } from '../../../interfaces/cron-job';
import { Owner } from '../../../services/settings/enums';

import schedule from 'node-schedule';

class LightSwitchComponent {
  id: number;
  
  i2cAddress: string; 
  pin: number; 
  status: string;
  
  scheduledCrons: any[] = []; 
  api;
  settings;
  db;
  
  mcp;

  constructor(id: number, i2cAddress: number, pin: number, scheduleArr, db, api, settings) {
    this.id = id;
    this.i2cAddress = i2cAddress.toString(16);
    this.pin = pin;
    this.db = db;
    this.api = api;
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
      this.mcp.pinMode(this.pin, this.mcp.OUTPUT);
    } else {
      console.log('[LIGHT-SWITCH]: EXIT on --> Raspberry not found');
    }
  }

  public async ON({expectedTime, owner, operatingMode}) {
    const self = this;
    return new Promise(async (resolve) => {
      const systemOperatingMode = self.settings.getOperatingMode();
      if(operatingMode >= systemOperatingMode) {
        const job = {
          owner, 
          id: self.id, 
          expectedTime, 
          executedTime: moment(),
          operatingMode: operatingMode,
          systemOperatingMode: systemOperatingMode,
        };
        switch(owner){
          case Owner.user: // manual action
            console.log("[LIGHT-SWITCH]: ON manual", job);
            await self.db.putItem('workers_list', job);
            resolve(job);
          break;
          case Owner.schedule: // scheduled action
            console.log("[LIGHT-SWITCH]: ON scheduled", job);
            await self.db.putItem('workers_list', job);
            resolve;
          break;
        };
      } else {
        console.log(`[LIGHT-SWITCH]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`);
      }
    });
  }

  public async OFF({expectedTime, owner, operatingMode}) {
    const self = this;
    return new Promise(async (resolve) => {
      const systemOperatingMode = self.settings.getOperatingMode();
      if(operatingMode >= systemOperatingMode) {
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
            console.log("[LIGHT-SWITCH]: OFF manual", job);
            await self.db.putItem('workers_list', job);
            resolve(job);
          break;
          case Owner.schedule: // scheduled action
            console.log("[LIGHT-SWITCH]: OFF scheduled", job);
            await self.db.putItem('workers_list', job);
            resolve;
          break;
        };
      } else {
        console.log(`[LIGHT-SWITCH]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`);
      }
    });
  }

  async setStatus(scheduledCrons) {
    const self = this;
    const owner = Owner.schedule;
    let scheduledStart;
    const now = moment();
    let status: string;
    let operatingMode: number;
    scheduledCrons.map(cron => {
      const statusStart = moment({'year': now.year(), 'month': now.month(), 'day': now.date(), 
      'hour': cron.atHour, 'minute': cron.atMinute});
      if(statusStart <= now) {
        status = cron.action;
        scheduledStart = statusStart;
        operatingMode = cron.operatingMode;
      }
    });
    self.status = status;
    console.log('[LIGHT-SWITCH]: status', self.status);
    self[self.status]({ expectedTime: scheduledStart, owner: owner, operatingMode });
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
      self.setStatus(scheduledCrons)
      
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
export default LightSwitchComponent
