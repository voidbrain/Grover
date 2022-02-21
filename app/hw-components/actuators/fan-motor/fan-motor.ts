import moment from "moment";


import { CronJobInterface } from '../../../interfaces/cron-job';
import { Owner, Peripherals } from '../../../services/settings/enums';

import schedule from 'node-schedule';

class FanComponent {
  id: number;
  parentId: number;
  parentName: string;
  serialNumber: { sn: string, found: boolean };
  
  i2cAddress: string; 
  pin: number; 
  status: string;
  
  scheduledCrons: any[] = []; 
  api;
  settings;
  db;
  
  mcp;

  constructor(parentId: number, parentName: string, id: number, i2cAddress: number, pin: number, scheduleArr, db, api, settings) {
    this.id = id;
    this.parentId = parentId;
    this.parentName = parentName;
    this.i2cAddress = '0x'+parseInt(i2cAddress.toString(10)).toString(16);
    this.pin = +pin;
    this.db = db;
    this.api = api;
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
          device: 1,
          debug: false
        });
        this.mcp.pinMode(this.pin, this.mcp.OUTPUT);
      });

      this.setSchedule(this.id, this.scheduledCrons);
    } else {
      console.log('[FAN-MOTOR]: EXIT on --> Raspberry OR i2c Address not found');
    }
  }

  public async ON({expectedTime, owner, operatingMode}) {
    const self = this;
    return new Promise(async (resolve) => {
      const systemOperatingMode = self.settings.getOperatingMode();
      if(operatingMode >= systemOperatingMode) {
        const job = {
          owner, 
          action: 'ON',
          idWorker: self.id, 
          parentId: self.parentId, 
          parentName: self.parentName, 
          type: Peripherals.Worker,
          expectedTime, 
          executedTime: moment(),
          operatingMode: operatingMode,
          systemOperatingMode: systemOperatingMode,
          serialNumber: self.serialNumber.sn,
        };
        switch(owner){
          case Owner.user: // manual action
            console.log("[FAN-MOTOR]: ON manual", job);
            await self.db.logItem('workers_log', job);
            resolve(job);
          break;
          case Owner.schedule: // scheduled action
            console.log("[FAN-MOTOR]: ON scheduled", job);
            await self.db.logItem('workers_log', job);
            resolve;
          break;
        };
      } else {
        console.log(`[FAN-MOTOR]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`);
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
          action: 'OFF',
          idWorker: self.id, 
          parentId: self.parentId, 
          parentName: self.parentName, 
          type: Peripherals.Worker,
          expectedTime: new Date(expectedTime), 
          executedTime: new Date(),
          operatingMode: operatingMode,
          systemOperatingMode: systemOperatingMode,
          serialNumber: self.serialNumber.sn,
        };
        switch(owner){
          case Owner.user: // manual action
            console.log("[FAN-MOTOR]: OFF manual");
            await self.db.logItem('workers_log', job);
            resolve(job);
          break;
          case Owner.schedule: // scheduled action
            console.log("[FAN-MOTOR]: OFF scheduled");
            await self.db.logItem('workers_log', job);
            resolve;
          break;
        };
      } else {
        console.log(`[FAN-MOTOR]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`);
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
    console.log('[FAN-MOTOR]: status', self.status);
    if(self.status) {
      self[self.status]({ expectedTime: scheduledStart, owner: owner, operatingMode });
    }
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
export default FanComponent
