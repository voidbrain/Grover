import { CronJobInterface } from '../../../interfaces/cron-job';
import { Owner } from '../../../services/settings/enums';

import sensor from 'ds18x20';
import schedule from 'node-schedule';

class TemperatureComponent {
  id: number;
  address: string;
  
  scheduledCrons: any[] = []; 
  api;
  settings;
  
  constructor(id: number, address: string, scheduleArr, api, settings) {
    this.settings = settings;
    this.address = address;
    
    this.id = id;
    this.api = api;
    this.scheduledCrons = scheduleArr;
    this.setSchedule(this.id, this.scheduledCrons)
  }

  public async READ({expectedTime, owner, operatingMode}) {
    const self = this;
    return new Promise(resolve => {
      const systemOperatingMode = self.settings.getOperatingMode();
      if(operatingMode >= systemOperatingMode) {
        sensor.get(self.address, function (err: any, value: any) {
          if (err) { throw err; }

          const job = {
            owner, 
            value, 
            id: self.id, 
            address: self.address,
            expectedTime, 
            executedTime: new Date(),
            operatingMode: operatingMode,
            systemOperatingMode: systemOperatingMode,
          };
          switch(owner){
            case Owner.user: // manual action
              console.log("[TEMP]: ", job);
              // this.api.get()
              resolve(job);
            break;
            case Owner.schedule: // scheduled action
              console.log("[TEMP]: ", job);
              // this.api.get()
              resolve;
            break;
          }
        });
      } else {
        console.log(`operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`);
      }
    });
  }

  async setSchedule(id: number, scheduledCrons: any[]){
    const self = this;
    if(id && scheduledCrons) {
      const scheduleArr: CronJobInterface[] = [];
      scheduledCrons.map(workerScheduleRow => {
        const scheduleRow:CronJobInterface = { 
          action: workerScheduleRow.action, 
          cron: `${workerScheduleRow.atMinute} ${workerScheduleRow.atHour} * * ${workerScheduleRow.atDay}`,
          operatingMode: workerScheduleRow.operatingMode,
        };
        scheduleArr.push(scheduleRow);
      })
      
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
