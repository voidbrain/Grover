import { CronJobInterface } from '../../../interfaces/cron-job';
import { Owner } from '../../../services/settings/enums';

import sensor from 'ds18x20';
import schedule from 'node-schedule';

class TemperatureComponent {
  id: number;
  address: string;
  
  scheduledCrons: any[] = []; 
  settings;
  operatingMode;
  
  constructor(id: number, address: string, scheduleArr, settings) {
    this.id = id;
    this.settings = settings;
    this.address = address;
    
    
    this.scheduledCrons = scheduleArr;
    this.setSchedule(this.id, this.scheduledCrons)
  }

  public async READ({expectedTime, owner}) {
    const self = this;
    return new Promise(resolve => {
      sensor.get(self.address, function (err: any, tempObj: any) {
        if (err) { throw err; }

        const job = {
          owner, 
          tempObj, 
          
          id: self.id, 
          expectedTime, 
          executedTime: new Date(),
        };
        switch(owner){
          case Owner.user: 
            resolve(job);
          break;
          case Owner.schedule: 
            resolve;
          break;
        }
      });
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
        console.log('[temp] => ', self.settings.getOperatingMode());
        console.log(+job.operatingMode >= +this.settings.getOperatingMode(), +job.operatingMode , this.settings.getOperatingMode())
        if(+job.operatingMode >= +this.settings.getOperatingMode()) {
          console.log('schedule');
          schedule.scheduleJob(job.cron, async (expectedTime) => {
            const owner = Owner.schedule;
            console.log(`this.${job.action}({'expectedTime': '${expectedTime}', owner: '${owner}'})`);
            const doJob = await eval(`this.${job.action}({'expectedTime': '${expectedTime}', owner: '${owner}'})`);
          })
        }
      });
    }
  }

}
export default TemperatureComponent;
