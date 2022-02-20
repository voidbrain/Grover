import { CronJobInterface } from '../../../interfaces/cron-job';
import { Owner, Peripherals } from '../../../services/settings/enums';

import sensor from 'ds18x20';
import schedule from 'node-schedule';
import moment from 'moment';
class TemperatureComponent {
  id: number;
  parentId: number;
  parentName: string;
  address: string;

  serialNumber: { sn: string, found: boolean };
  
  scheduledCrons: any[] = []; 
  api;
  db;
  settings;
  
  constructor(parentId: number, parentName: string, id: number, address: string, scheduleArr, db, api, settings) {
    this.id = id;
    this.parentId = parentId;
    this.parentName = parentName;
    this.address = address;
    this.scheduledCrons = scheduleArr;
    this.settings = settings;
    this.api = api;
    this.db = db;
    this.setup();
  }

  async setup(){
    const self = this;
    self.serialNumber = await self.settings.getSerialNumber();
    if(self.serialNumber.found) {
      this.setSchedule(this.id, this.scheduledCrons);
    } else {
      console.log('[TEMPERATURE]: EXIT on --> Raspberry not found');
    }
  }

  public async READ({expectedTime, owner, operatingMode}) {
    const self = this;
    return new Promise(async (resolve) => {
      const systemOperatingMode = self.settings.getOperatingMode();
      self.serialNumber = await self.settings.getSerialNumber();
      if(self.serialNumber.found) {
        if(operatingMode >= systemOperatingMode) {
          sensor.get(self.address, async function (err: any, value: any) {
            if(err) { throw err; }
            const job = {
              owner, 
              action: 'READ',
              value, 
              idProbe: self.id, 
              parentId: self.parentId, 
              parentName: self.parentName, 
              type: Peripherals.Probe,
              address: self.address,
              expectedTime: expectedTime ? new Date(expectedTime) : null, 
              executedTime: new Date(),
              operatingMode: operatingMode,
              systemOperatingMode: systemOperatingMode,
              serialNumber: self.serialNumber.sn,
            };
            switch(owner){
              case Owner.user: // manual action
                console.log("[TEMP]: READ manual", job);
                await self.db.logItem('probes_log', job);
                resolve(job);
              break;
              case Owner.schedule: // scheduled action
                console.log("[TEMP]: READ schedule", job);
                await self.db.logItem('probes_log', job);
                resolve;
              break;
            }
          });
        } else {
          console.log(`[TEMP]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`);
        }
      } else {
        console.log('[TEMP]: EXIT on --> Raspberry not found');
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
export default TemperatureComponent;
