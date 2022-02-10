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
  schedule;
  
  constructor(parentId: string, id: string, scheduleArr: CronJobInterface[]) {
    this.id = id;
    this.parentId = parentId;
    this.scheduleArr = scheduleArr;

    this.setSchedule(this.id, this.parentId, this.scheduleArr);
  }

  async read(owner) {
    const self = this;
    return new Promise(resolve => {
      sensor.get(self.id, function (err: any, tempObj: any) {
        if (err) { throw err; }
        // resolve(tempObj);
        
        console.log("==>", owner, tempObj, 
        self.parentId, self.id, new Date());
      });
    });
  }

  async setSchedule(parentId: string, id: string, scheduleArr: CronJobInterface[]){
    if(scheduleArr !== undefined) {
      scheduleArr.map(job => {
        schedule.scheduleJob(job.cron, () => {
          const options = JSON.stringify(job.options); 
          const result = eval(`this.${job.action}('${Owner.schedule}')`)
        });
      });
    } else {
      console.log('else', parentId, id, scheduleArr)
    }
  }

}
export default TemperatureComponent;
