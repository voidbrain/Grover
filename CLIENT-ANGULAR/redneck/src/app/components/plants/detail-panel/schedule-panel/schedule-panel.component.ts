/* eslint-disable @typescript-eslint/no-this-alias */
import { Component, Input, OnChanges } from '@angular/core';
import  { stringToArray } from 'cron-converter';
import { getDay } from 'date-fns';

import { ScheduleTypes, Peripherals } from '../../../../../app/services/settings/enum';
import { SettingsService } from '../../../../../app/services/settings/settings.service';
import { PlantExtended } from '../../../../interfaces/plant';
import { RoomExtended } from '../../../../interfaces/room';
import { IonSegment, IonGrid, IonRow, IonCol, IonButton, IonLabel } from "@ionic/angular/standalone";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTemperatureHalf, faRuler, faPlug, faSwatchbook, faArrowsRotate, faWhiskeyGlass, faFan, faLightbulb } from '@fortawesome/free-solid-svg-icons';

export interface weekRow  {
  key: string, values: any[]
}

@Component({
  selector: 'app-schedule-panel',
  standalone: true,
  imports: [IonLabel, IonButton, IonCol, IonRow, IonGrid, IonSegment, FontAwesomeModule],
  templateUrl: './schedule-panel.component.html',
  styleUrl: './schedule-panel.component.scss'
})
export class SchedulePanelComponent implements OnChanges {
  faTemperatureHalf = faTemperatureHalf; 
  faRuler = faRuler;
  faPlug = faPlug;
  faSwatchbook = faSwatchbook;
  faArrowsRotate = faArrowsRotate;
  faWhiskeyGlass = faWhiskeyGlass;
  faFan = faFan;
  faLightbulb = faLightbulb;
  
  @Input() plant!: PlantExtended;
  @Input() room!: RoomExtended;

  items: any;

  todayOfTheWeek!: number;
  settings!: any;

  

  daysOfWeek: weekRow[] = [
    
    { key: 'M', values: []},
    { key: 'T', values: []},
    { key: 'W', values: []},
    { key: 'T', values: []},
    { key: 'F', values: []},
    { key: 'S', values: []},
  ];
  actualDayIndex!: number;

  chartConfig : any[] = [];
  hoursOfDay : any[] = [];
  

  ngOnChanges() {
    if(this.room && this.plant) {
      this.setup();
    }
  }

  popuplateDaysArray(item: any, scheduleRow: any) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    if(scheduleRow) {
      const stringCron = `${scheduleRow.atMinute} ${scheduleRow.atHour} * * ${scheduleRow.atDay}`;
      
      const cronArray = stringToArray(stringCron);
      const daysWorkingCron = cronArray[4];
      const hoursWorkingCron = cronArray[1];
      const minutesWorkingCron = cronArray[0];

      daysWorkingCron.map((day: any) => {
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
            { atDay: day, atHour: hoursWorkingCron.map((hour:any) => hour) , atMinute: minutesWorkingCron[0]}
          ),
          operatingMode: scheduleRow.operatingMode
        };
        self.daysOfWeek[day].values.push(el);
      });
    }
  }

  setup() {
    const self = this;
    
    self.settings = new SettingsService();
    self.todayOfTheWeek = getDay(new Date());
    self.actualDayIndex = self.todayOfTheWeek;
    for(let i = 0; i< 24; i++) { self.hoursOfDay.push(i.toString().padStart(2, '0'));}

    self.room.workers?.map(item => {
      if(item.schedule && item.schedule.length) {
        item.schedule.map((el: any) => {
          self.popuplateDaysArray(item, el);
        });
      }
    });
    self.room.probes?.map(item => {
      if(item.schedule && item.schedule.length) {

        item.schedule.map((el: any) => {
          self.popuplateDaysArray(item, el);
        });
      }
    });
    self.plant.workers?.map(item => {
      if(item.schedule && item.schedule.length) {
        item.schedule.map((el: any) => {
          self.popuplateDaysArray(item, el);
        });
      }
    });
    self.plant.probes?.map(item => {
      if(item.schedule && item.schedule.length) {
        item.schedule.map((el: any) => {
          self.popuplateDaysArray(item, el);
        });
      }
    });

    self.daysOfWeek.map(day => {
      const data: {labels: any[], datasets: any[]} = {
        labels: [...day.values.map(el => el.key)],
        datasets: [],
      };

      day.values.map((peripheral) => {
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

    this.daysOfWeek.push((this.daysOfWeek.shift()) as weekRow);
  }

  setDayVisualization(index: any){
    this.actualDayIndex = (index < 6 ? index+1 : 0);
  }

}
