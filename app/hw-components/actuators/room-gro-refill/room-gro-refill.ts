// import i2cBus from 'i2c-bus';


import { CronJobInterface } from '../../../interfaces/cron-job';
import { Owner, Peripherals, ServerCommands } from '../../../services/settings/enums';

import schedule from 'node-schedule';
import moment from 'moment';

class RoomGroRefillComponent {
  id: number;
  parentId: number;
  parentName: string;
  i2cAddress: string; 
  pin1: number; 
  pin2: number;
  primaryGroPump

  serialNumber: { sn: string, found: boolean };
  
  scheduledCrons: any[] = []; 
  api;
  settings;
  db;

  status: string;

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
  }

  async setup(){
    const self = this;
    self.serialNumber = await self.settings.getSerialNumber();
    if(self.serialNumber.found && +self.i2cAddress) {
      import('node-mcp23017').then(({default: MCP23017}) => {
        this.primaryGroPump = new MCP23017({
          address: +self.i2cAddress,
          device: 1,
          debug: false
        });
        this.primaryGroPump.pinMode(this.pin1, this.primaryGroPump.OUTPUT);
        this.primaryGroPump.pinMode(this.pin2, this.primaryGroPump.OUTPUT);
      });
      this.setSchedule(this.id, this.scheduledCrons);
    } else {
      console.log('[ROOM-Gro-REFILL]: EXIT on --> Raspberry OR i2c Address not found');
    }
  }

  async setStatus(){
    this.status = null;
  }

  public async delay (milliseconds) {
    return new Promise(resolve => {
      return setTimeout(() => {
        resolve(true);
      }, milliseconds);
    });
  }

  public async forward () {
    console.log("[ROOM-Gro-REFILL]: forward")
    return new Promise((resolve, reject) => {
      this.primaryGroPump.digitalWrite(this.pin1, this.primaryGroPump.HIGH);
      this.primaryGroPump.digitalWrite(this.pin2, this.primaryGroPump.LOW);
      resolve(true);
    })
  };

  public async backward () {
    return new Promise(resolve => {
      this.primaryGroPump.digitalWrite(this.pin1, this.primaryGroPump.LOW);
      this.primaryGroPump.digitalWrite(this.pin2, this.primaryGroPump.HIGH);
      resolve(true);
    });
  };

  public async stop () {
    console.log("[ROOM-Gro-REFILL]: stop")
    return new Promise(resolve => {
      this.primaryGroPump.digitalWrite(this.pin1, this.primaryGroPump.LOW);
      this.primaryGroPump.digitalWrite(this.pin2, this.primaryGroPump.LOW);
      resolve(true);
    });
  };

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
export default RoomGroRefillComponent