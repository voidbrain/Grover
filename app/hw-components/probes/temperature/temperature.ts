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
    

    this.operatingMode = this.settings.getOperatingMode();
    this.setSchedule(this.id, this.parentId, this.scheduleArr)
  }

  public async read({expectedTime, owner}) {
    const self = this;
    return new Promise(resolve => {
      sensor.get(self.id, function (err: any, tempObj: any) {
        if (err) { throw err; }

        const r = {
          owner, 
          tempObj, 
          parentId: self.parentId, 
          id: self.id, 
          expectedTime, 
          executedTime: new Date(),
        };
        switch(owner){
          case Owner.user: 
            resolve(r);
          break;
          case Owner.schedule: 
            console.log(JSON.stringify(r));
            resolve;
          break;
        }
      });
    });
  }

  async setSchedule(parentId: string, id: string, scheduleArr: CronJobInterface[]){
    if(parentId && id && scheduleArr) {
      scheduleArr.map(job => {
        schedule.scheduleJob(job.cron, async (expectedTime) => {
          const owner = Owner.schedule;
          const r = await eval(`this.${job.action}({'expectedTime': '${expectedTime}', owner: '${owner}'})`);
        })
      });
    }
  }

}
export default TemperatureComponent;
