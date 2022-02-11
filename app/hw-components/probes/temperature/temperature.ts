import { CronJobInterface } from '../../../interfaces/cron-job';

import sensor from 'ds18x20';
import schedule from 'node-schedule';

const Owner = {
  schedule: 'schedule',
  user: 'user'
};

class TemperatureComponent {
  id: string;
  parentId: string;
  scheduleArr: CronJobInterface[] = []; 
  
  constructor(parentId: string, id: string, scheduleArr: CronJobInterface[]) {
    this.id = id;
    this.parentId = parentId;
    this.scheduleArr = scheduleArr;

    this.setSchedule(this.id, this.parentId, this.scheduleArr);
  }

  async read(expectedTime, owner) {
    const self = this;
    return new Promise(resolve => {
      sensor.get(self.id, function (err: any, tempObj: any) {
        if (err) { throw err; }
        // resolve(tempObj);
        
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
        schedule.scheduleJob(job.cron, async (expectedTime) => {
          const options = JSON.stringify(job.options); 
          const r = await eval(`this.${job.action}('${expectedTime}','${Owner.schedule}')`);
          console.log('scheduled');
          console.log(JSON.stringify(r));
        });
      });
    }
  }

}
export default TemperatureComponent;
