import { CronJobInterface } from '../../../interfaces/cron-job';
import { Owner } from '../../../services/settings/enums';

import sensor from 'ds18x20';
import schedule from 'node-schedule';
import moment from 'moment';
class TemperatureComponent {
  id: number;
  address: string;
  
  scheduledCrons: any[] = []; 
  api;
  db;
  settings;
  
  constructor(id: number, address: string, scheduleArr, db, api, settings) {
    this.id = id;
    this.address = address;
    this.scheduledCrons = scheduleArr;
    this.setSchedule(this.id, this.scheduledCrons)
    this.settings = settings;
    this.api = api;
    this.db = db;
  }

  public async READ({expectedTime, owner, operatingMode}) {
    const self = this;
    return new Promise(async (resolve) => {
      const systemOperatingMode = self.settings.getOperatingMode();
      if((await self.settings.getSerialNumber()).found) {
        if(operatingMode >= systemOperatingMode) {
          sensor.get(self.address, async function (err: any, value: any) {
            if(err) { throw err; }
            const job = {
              owner, 
              value, 
              id: self.id, 
              address: self.address,
              expectedTime: moment(expectedTime), 
              executedTime: moment(),
              operatingMode: operatingMode,
              systemOperatingMode: systemOperatingMode,
            };
            switch(owner){
              case Owner.user: // manual action
                console.log("[TEMP]: READ manual", job);
                await self.db.putItem('probes_list', job);
                resolve(job);
              break;
              case Owner.schedule: // scheduled action
                console.log("[TEMP]: READ schedule", job);
                await self.db.putItem('probes_list', job);
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
