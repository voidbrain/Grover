import { Component, Input, OnChanges } from '@angular/core';
import  Cron from 'cron-converter';
import { setMinutes, getDay } from 'date-fns';

import { ScheduleTypes, Peripherals } from '../../../../../app/services/settings/enum';
import { SettingsService } from '../../../../../app/services/settings/settings.service';
import { PlantExtended } from '../../../../interfaces/plant';
import { RoomExtended } from '../../../../interfaces/room';


@Component({
  selector: 'app-schedule-panel',
  standalone: true,
  imports: [],
  templateUrl: './schedule-panel.component.html',
  styleUrl: './schedule-panel.component.scss'
})
export class SchedulePanelComponent implements OnChanges {

  @Input() plant: PlantExtended;
  @Input() room: RoomExtended;

  items;

  todayOfTheWeek: number;
  settings;

  daysOfWeek = [
    { key: 'S', values: []},
    { key: 'M', values: []},
    { key: 'T', values: []},
    { key: 'W', values: []},
    { key: 'T', values: []},
    { key: 'F', values: []},
    { key: 'S', values: []},
  ];
  actualDayIndex: number;

  chartConfig = [];
  hoursOfDay = [];

  ngOnChanges() {
    if(this.room && this.plant) {
      this.setup();
    }
  }

  popuplateDaysArray(item, scheduleRow) {
    const self = this;
    if(scheduleRow) {
      const stringCron = `${scheduleRow.atMinute} ${scheduleRow.atHour} * * ${scheduleRow.atDay}`;
      const cronInstance = new Cron();
      cronInstance.fromString(stringCron);
      const cronArray = cronInstance.toArray();
      // console.log(cronArray);
      const daysWorkingCron = cronArray[4];
      const hoursWorkingCron = cronArray[1];
      const minutesWorkingCron = cronArray[0];

      daysWorkingCron.map((day, index) => {
        const el = {
          title: item.type.title,
          key: item.type.type,
          color: item.type.color,
          icon: item.type.icon,
          itemType: (item.workerType ? Peripherals.Worker : Peripherals.Probe),
          scheduleType: (item.workerType ? ScheduleTypes.From_To : ScheduleTypes.At),
          cron: (
            item.workerType ?
            { atDay: day, from: hoursWorkingCron[0], to: hoursWorkingCron[hoursWorkingCron.length-1], atMinute: minutesWorkingCron[0] } :
            { atDay: day, atHour: hoursWorkingCron.map(hour => hour) , atMinute: minutesWorkingCron[0]}
          ),
          operatingMode: scheduleRow.operatingMode
        };
        self.daysOfWeek[day].values.push(el);
      });
    }
  }

  setup() {
    const self = this;
    const today = setMinutes(new Date(), 0);
    self.settings = new SettingsService();
    self.todayOfTheWeek = getDay(new Date());
    self.actualDayIndex = self.todayOfTheWeek;
    for(let i = 0; i< 24; i++) { self.hoursOfDay.push(i.toString().padStart(2, '0'));}

    self.room.workers?.map(item => {
      if(item.schedule && item.schedule.length) {
        item.schedule.map(el => {
          self.popuplateDaysArray(item, el);
        });
      }
    });
    self.room.probes?.map(item => {
      if(item.schedule && item.schedule.length) {

        item.schedule.map(el => {
          self.popuplateDaysArray(item, el);
        });
      }
    });
    self.plant.workers?.map(item => {
      if(item.schedule && item.schedule.length) {
        item.schedule.map(el => {
          self.popuplateDaysArray(item, el);
        });
      }
    });
    self.plant.probes?.map(item => {
      if(item.schedule && item.schedule.length) {
        item.schedule.map(el => {
          self.popuplateDaysArray(item, el);
        });
      }
    });

    self.daysOfWeek.map(day => {
      const data = {
        labels: [...day.values.map(el => el.key)],
        datasets: [],
      };
      const labels: string[] = [];

      day.values.map((peripheral, index) => {
        const peripheralArr = [];
        peripheralArr.push(peripheral.scheduleType === ScheduleTypes.From_To ?
          { element: peripheral.title,
          scheduleType: peripheral.scheduleType,
          color: peripheral.color,
          icon: peripheral.icon,
          atDay: peripheral.cron.atDay,
          atMinute: peripheral.cron.atMinute.toString().padStart(2, '0'),
          operatingMode: peripheral.operatingMode,
          hourValues: [peripheral.cron.from, peripheral.cron.to] } :
          { element: peripheral.title,
          scheduleType: peripheral.scheduleType,
          color: peripheral.color,
          icon: peripheral.icon,
          atDay: peripheral.cron.atDay,
          atMinute: peripheral.cron.atMinute.toString().padStart(2, '0'),
          operatingMode: peripheral.operatingMode,
          hourValues: peripheral.cron.atHour }
        );

        const dataset = {
          data: peripheralArr,
          type: null
        };

        data.datasets.push(dataset);
      });

      const chartConfig = {
        data,
      };
      self.chartConfig.push(chartConfig);
    });

    this.daysOfWeek.push(this.daysOfWeek.shift());
  }

  setDayVisualization(index){
    this.actualDayIndex = (index < 6 ? index+1 : 0);
  }

}
