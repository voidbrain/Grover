import { CronJobInterface } from '../../../interfaces/cron-job';
import { Owner } from '../../../services/settings/enums';

import schedule from 'node-schedule';

import PinPWM from 'pigpio-l298n/PinPWM.js';
import PinWrite from 'pigpio-l298n/PinWrite.js';

import { Device } from '../../../interfaces/water-refill';
import { WaterRefillInterface } from '../../../interfaces/water-refill';

// enableA,in1,in2, enableB,in3,in4
// let l298n = new l298nModule(14,15,18, 21,20,16);

// const Direction = {
//   forward: 'forward',
//   backward: 'backward'
// };

class WaterRefillComponent {
  id: string;
  
  scheduledCrons: any[] = []; 
  settings;
  operatingMode;

  constructor(id: string, scheduleArr, settings) {
    this.id = id;
    this.settings = settings;

    this.scheduledCrons = scheduleArr;
    this.setSchedule(this.id, this.scheduledCrons)
  }

  public async REFILL({expectedTime, owner}) {
    const self = this;
    return new Promise(resolve => {
      // let worker;
      // worker.get(self.id, function (err: any, tempObj: any) {
      //   if (err) { throw err; }

      //   const job = {
      //     owner, 
      //     tempObj, 
          
      //     id: self.id, 
      //     expectedTime, 
      //     executedTime: new Date(),
      //   };
      //   switch(owner){
      //     case Owner.user: 
      //       resolve(job);
      //     break;
      //     case Owner.schedule: 
      //       resolve;
      //     break;
      //   }
      // });
    });
  }

  async setSchedule(id: string, scheduledCrons: any[]){
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
        if(job.operatingMode >= this.settings.getOperatingMode()) {
          schedule.scheduleJob(job.cron, async (expectedTime) => {
            const owner = Owner.schedule;
            const doJob = await eval(`this.${job.action}({'expectedTime': '${expectedTime}', owner: '${owner}'})`);
          })
        }
      });
    }
  }
}
export default WaterRefillComponent;
