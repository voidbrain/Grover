import { CronJobInterface } from '../../../interfaces/cron-job';
import { SettingsService } from '../../../services/settings/settings.service'

import { Owner } from '../../../services/settings/enums';

import sensor from 'ds18x20';
import schedule from 'node-schedule';

class TemperatureComponent {
  id: string;
  parentId: string;
  scheduleArr: CronJobInterface[] = []; 
  settings = new SettingsService();
  operatingMode
  
  constructor(parentId: string, id: string, scheduleString: string) {
    this.id = id;
    this.parentId = parentId;
    this.scheduleArr = JSON.parse(scheduleString).schedule;
    

    this.setSchedule(this.id, this.parentId, this.scheduleArr);
    this.operatingMode = this.settings.getOperatingMode();
  }

  async read(expectedTime, owner) {
    const self = this;
    return new Promise(resolve => {
      sensor.get(self.id, function (err: any, tempObj: any) {
        if (err) { throw err; }        
        resolve({
          owner, 
          tempObj, 
          parentId: self.parentId, 
          id: self.id, 
          expectedTime, 
          executedTime: new Date(),
        });
      });
    });
  }

  async setSchedule(parentId: string, id: string, scheduleArr: CronJobInterface[]){
    if(parentId && id && scheduleArr) {
      scheduleArr.map(job => {
        console.log("==>", id, parentId, job.cron)
        schedule.scheduleJob(job.cron, async (expectedTime) => {
          const options = JSON.stringify(job.options); 
          const r = await eval(`this.${job.action}('${expectedTime}','${Owner.schedule}')`);
          console.log('scheduled', r.id, r.parentId, job.cron);
        });
      });
    }
  }

}
export default TemperatureComponent;
