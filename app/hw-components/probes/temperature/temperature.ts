import { CronJobInterface } from '../../../interfaces/cron-job';
import { SettingsService } from '../../../services/settings/settings.service'

import { Owner } from '../../../services/settings/enums';

import sensor from 'ds18x20';
import schedule from 'node-schedule';

class TemperatureComponent {
  id: string;
  parentId: string;
  parentType: string;
  scheduleArr: CronJobInterface[] = []; 
  settings = new SettingsService();
  operatingMode
  
  constructor(parentId: string, parentType: string, id: string, scheduleString: string) {
    this.id = id;
    this.parentId = parentId;
    this.parentType = parentType;
    this.scheduleArr = (scheduleString ? JSON.parse(scheduleString).schedule : null);
    
    this.operatingMode = this.settings.getOperatingMode();
    this.setSchedule(this.id, this.scheduleArr)
  }

  public async read({expectedTime, owner}) {
    const self = this;
    return new Promise(resolve => {
      sensor.get(self.id, function (err: any, tempObj: any) {
        if (err) { throw err; }

        const job = {
          owner, 
          tempObj, 
          parentId: self.parentId,
          type: self.parentType, 
          id: self.id, 
          expectedTime, 
          executedTime: new Date(),
        };
        switch(owner){
          case Owner.user: 
            resolve(job);
          break;
          case Owner.schedule: 
            console.log(JSON.stringify(job));
            resolve;
          break;
        }
      });
    });
  }

  async setSchedule(id: string, scheduleArr: CronJobInterface[]){
    if(id && scheduleArr) {
      scheduleArr.map(job => {
        schedule.scheduleJob(job.cron, async (expectedTime) => {
          const owner = Owner.schedule;
          const doJob = await eval(`this.${job.action}({'expectedTime': '${expectedTime}', owner: '${owner}'})`);
        })
      });
    }
  }

}
export default TemperatureComponent;
