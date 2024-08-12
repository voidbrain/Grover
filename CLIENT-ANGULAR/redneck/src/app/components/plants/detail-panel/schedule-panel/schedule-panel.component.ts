import { Component, Input, OnChanges } from '@angular/core';
import { NgClass } from '@angular/common';
import { stringToArray } from 'cron-converter';
import { getDay } from 'date-fns';

import {
  ScheduleTypes,
  Peripherals,
} from '../../../../../app/services/settings/enum';
import { SettingsService } from '../../../../../app/services/settings/settings.service';
import { PlantExtendedInterface } from '../../../../interfaces/plant';
import { RoomExtendedInterface } from '../../../../interfaces/room';
import {
  IonSegment,
  IonSegmentButton,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
} from '@ionic/angular/standalone';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTemperatureHalf,
  faRuler,
  faPlug,
  faSwatchbook,
  faArrowsRotate,
  faWhiskeyGlass,
  faFan,
  faLightbulb,
} from '@fortawesome/free-solid-svg-icons';

export interface weekRow {
  key: string;
  values: unknown[];
}

@Component({
  selector: 'app-schedule-panel',
  standalone: true,
  imports: [
    IonLabel,
    IonCol,
    IonRow,
    IonGrid,
    IonSegment,
    IonSegmentButton,
    FontAwesomeModule,
    NgClass,
  ],
  templateUrl: './schedule-panel.component.html',
  styleUrl: './schedule-panel.component.scss',
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

  @Input() plant!: PlantExtendedInterface;
  @Input() room!: RoomExtendedInterface;

  items: unknown;

  todayOfTheWeek!: number;
  settings!: unknown;

  daysOfWeek: weekRow[] = [
    { key: 'S', values: [] },
    { key: 'M', values: [] },
    { key: 'T', values: [] },
    { key: 'W', values: [] },
    { key: 'T', values: [] },
    { key: 'F', values: [] },
    { key: 'S', values: [] },
  ];
  actualDayIndex!: number;

  chartConfig: unknown[] = [];
  hoursOfDay: unknown[] = [];

  ngOnChanges() {
    if (this.room && this.plant) {
      this.setup();
    }
  }

  popuplateDaysArray(item: weekRow, scheduleRow) {
    if (scheduleRow) {
      const stringCron = `${scheduleRow.atMinute} ${scheduleRow.atHour} * * ${scheduleRow.atDay}`;

      const cronArray = stringToArray(stringCron);
      const daysWorkingCron = cronArray[4];
      const hoursWorkingCron = cronArray[1];
      const minutesWorkingCron = cronArray[0];

      daysWorkingCron.map((day) => {
        const el = {
          title: item.type.title,
          key: item.type.type,
          color: item.type.color,
          icon: item.type.icon,
          itemType: item.workerType ? Peripherals.Worker : Peripherals.Probe,
          scheduleType: item.workerType
            ? ScheduleTypes.From_To
            : ScheduleTypes.At,
          cron: item.workerType
            ? {
                atDay: day,
                from: hoursWorkingCron[0],
                to: hoursWorkingCron[hoursWorkingCron.length - 1],
                atMinute: minutesWorkingCron[0],
              }
            : {
                atDay: day,
                atHour: hoursWorkingCron.map((hour) => hour),
                atMinute: minutesWorkingCron[0],
              },
          operatingMode: scheduleRow.operatingMode,
        };
        this.daysOfWeek[day].values.push(el);
      });
    }
  }

  setup() {
    this.settings = new SettingsService();
    this.todayOfTheWeek = getDay(new Date());
    this.actualDayIndex = this.todayOfTheWeek;
    for (let i = 0; i < 24; i++) {
      this.hoursOfDay.push(i.toString().padStart(2, '0'));
    }

    this.room.workers?.map((item) => {
      if (item.schedule && item.schedule.length) {
        item.schedule.map((el) => {
          this.popuplateDaysArray(item, el);
        });
      }
    });
    this.room.probes?.map((item) => {
      if (item.schedule && item.schedule.length) {
        item.schedule.map((el) => {
          this.popuplateDaysArray(item, el);
        });
      }
    });
    this.plant.workers?.map((item) => {
      if (item.schedule && item.schedule.length) {
        item.schedule.map((el) => {
          this.popuplateDaysArray(item, el);
        });
      }
    });
    this.plant.probes?.map((item) => {
      if (item.schedule && item.schedule.length) {
        item.schedule.map((el) => {
          this.popuplateDaysArray(item, el);
        });
      }
    });

    this.daysOfWeek.map((day) => {
      const data: { labels: string[]; datasets: object[] } = {
        labels: [...day.values.map((el) => el.key)],
        datasets: [],
      };

      day.values.map((peripheral) => {
        const peripheralArr = [];
        peripheralArr.push(
          peripheral.scheduleType === ScheduleTypes.From_To
            ? {
                element: peripheral.title,
                scheduleType: peripheral.scheduleType,
                color: peripheral.color,
                icon: peripheral.icon,
                atDay: peripheral.cron.atDay,
                atMinute: peripheral.cron.atMinute.toString().padStart(2, '0'),
                operatingMode: peripheral.operatingMode,
                hourValues: [peripheral.cron.from, peripheral.cron.to],
              }
            : {
                element: peripheral.title,
                scheduleType: peripheral.scheduleType,
                color: peripheral.color,
                icon: peripheral.icon,
                atDay: peripheral.cron.atDay,
                atMinute: peripheral.cron.atMinute.toString().padStart(2, '0'),
                operatingMode: peripheral.operatingMode,
                hourValues: peripheral.cron.atHour,
              },
        );

        const dataset = {
          data: peripheralArr,
          type: null,
        };

        data.datasets.push(dataset);
      });

      const chartConfig = {
        data,
      };
      this.chartConfig.push(chartConfig);
    });

    this.daysOfWeek.push(this.daysOfWeek.shift() as weekRow);
  }

  setDayVisualization(index) {
    this.actualDayIndex = index < 6 ? index + 1 : 0;
  }
}
