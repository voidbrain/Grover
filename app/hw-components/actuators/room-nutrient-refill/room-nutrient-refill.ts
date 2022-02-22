// import i2cBus from 'i2c-bus';


import { CronJobInterface } from '../../../interfaces/cron-job';
import { Owner, Peripherals, ServerCommands } from '../../../services/settings/enums';

import schedule from 'node-schedule';
import moment from 'moment';

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

  serialNumber: { sn: string, found: boolean };
  
  scheduledCrons: any[] = []; 
  api;
  settings;
  db;

  status: string;

  constructor(parentId: number, parentName: string, id: number, 
    // i2cAddressGro: number, pin1Gro: number, pin2Gro: number, 
    // i2cAddressMicro: number, pin1Micro: number, pin2Micro: number, 
    // i2cAddressBloom: number, pin1Bloom: number, pin2Bloom: number, 
    // i2cAddressRipen: number, pin1Ripen: number, pin2Ripen: number, 
    primaryNutrientPumpGro,
    primaryNutrientPumpMicro,
    primaryNutrientPumpBloom,
    primaryNutrientPumpRipen,

    scheduleArr, db, api, settings) {
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
    this.primaryNutrientPumpGro = primaryNutrientPumpGro,
    this.primaryNutrientPumpMicro = primaryNutrientPumpMicro,
    this.primaryNutrientPumpBloom = primaryNutrientPumpBloom,
    this.primaryNutrientPumpRipen = primaryNutrientPumpRipen,
    this.api = api;
    this.db = db;
    this.settings = settings;
    this.scheduledCrons = scheduleArr;
  }

  async setup(){
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
    //   console.log('[ROOM-Nutrient-REFILL]: EXIT on --> Raspberry OR i2c Address not found');
    // }
  }

  async setStatus(){
    this.status = null;
  }

  public async delay (seconds) {
    return new Promise(resolve => {
      return setTimeout(() => {
        resolve(true);
      }, seconds*1000);
    });
  }

  public async forward (pump) {
    const self = this;
    console.log(`[ROOM-Nutrient-REFILL]: forward ${pump}`);
    await self[pump].forward();

    // return new Promise((resolve, reject) => {
    //   this[`primaryNutrientPump${pump}`].digitalWrite(this[`pin1${pump}`], this[`primaryNutrientPump${pump}`].HIGH);
    //   this[`primaryNutrientPump${pump}`].digitalWrite(this[`pin2${pump}`], this[`primaryNutrientPump${pump}`].LOW);
    //   resolve(true);
    // })
  };

  public async backward (pump) {
    const self = this;
    console.log(`[ROOM-Nutrient-REFILL]: forward ${pump}`);
    await self[pump].backward();
  };

  public async stop (pump) {
    const self = this;
    console.log(`[ROOM-Nutrient-REFILL]: forward ${pump}`);
    await self[pump].stop();
  };

  public async RUN_NUTRIENT({expectedTime, owner, operatingMode}) {
    const self = this;
    return new Promise(async (resolve) => {
      const systemOperatingMode = self.settings.getOperatingMode();
      if(operatingMode >= systemOperatingMode) {
        const pumpGro = 'Gro';
        const pumpMicro = 'Micro';
        const pumpBloom = 'Bloom';
        const pumpRipen = 'Ripen';

        await this.forward(pumpGro);
        await this.delay(2000);
        await this.stop(pumpGro);
        // ...

        const job = {
          owner, 
          action: ServerCommands.RUN_NUTRIENT,
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
            console.log("[ROOM-Nutrient-REFILL]: RUN_NUTRIENT manual", job);
            if (self.settings.getLogMode() === true) { 
              await self.db.logItem('workers_log', job); 
              resolve(job);
            }
          break;
          case Owner.schedule: // scheduled action
            console.log("[ROOM-Nutrient-REFILL]: RUN_NUTRIENT scheduled", job);
            if (self.settings.getLogMode() === true) { 
              await self.db.logItem('workers_log', job); 
              resolve;
            }
          break;
        };
      } else {
        console.log(`[ROOM-Nutrient-REFILL]: RUN_NUTRIENT operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`);
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
export default RoomNutrientRefillComponent
