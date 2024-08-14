

export interface rowOptions {
  key: string
}
export interface weekRow {
  key: string;
  values: rowOptions| PeripheralInterface[];
  type?: string;
}

import { Component, Input, OnChanges } from '@angular/core';
import { NgClass } from '@angular/common';
import { stringToArray } from 'cron-converter';
import { getDay } from 'date-fns';

import {
  ScheduleTypes,
  Peripherals,
} from '../../../../../app/services/settings/enum';
import { SettingsService } from '../../../../../app/services/settings/settings.service';

import { PeripheralInterface, ScheduleRow } from '../../../../interfaces/peripheral';
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
import { WorkerInterface } from '../../../../interfaces/worker';
import { WorkerTypeInterface } from '../../../../interfaces/workerType';
import { ProbeInterface } from '../../../../interfaces/probe';
import { WorkerScheduleInterface } from '../../../../interfaces/workerSchedule';
import { ProbeScheduleInterface } from '../../../../interfaces/probeSchedule';

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

  popuplateDaysArray(item: ProbeInterface | WorkerInterface, scheduleRow: ScheduleRow | WorkerScheduleInterface | ProbeScheduleInterface) {
    if (scheduleRow) {
      const stringCron = `${scheduleRow.atMinute} ${scheduleRow.atHour} * * ${scheduleRow.atDay}`;

      const cronArray = stringToArray(stringCron);
      const daysWorkingCron = cronArray[4];
      const hoursWorkingCron = cronArray[1];
      const minutesWorkingCron = cronArray[0];

      daysWorkingCron.map((day) => {
        const el = {
          title: (item?.type as WorkerTypeInterface)?.title,
          key: (item?.type as WorkerTypeInterface)?.type,
          color: (item?.type as WorkerTypeInterface)?.color,
          icon: (item?.type as WorkerTypeInterface)?.icon,
          itemType: Object.prototype.hasOwnProperty.call(item, "workerType") ? Peripherals.Worker : Peripherals.Probe,
          scheduleType: Object.prototype.hasOwnProperty.call(item, "workerType")
            ? ScheduleTypes.From_To
            : ScheduleTypes.At,
          cron: Object.prototype.hasOwnProperty.call(item, "workerType")
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
        (this.daysOfWeek[day].values as PeripheralInterface[]).push(el as unknown as PeripheralInterface);
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

    this.room.workers?.map((item: WorkerInterface) => {
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
        labels: [...(day.values as PeripheralInterface[]).map((el) => el.key)] as string[],
        datasets: [],
      };

      (day.values as PeripheralInterface[]).map((peripheral: PeripheralInterface) => {
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

  setDayVisualization(index: number) {
    this.actualDayIndex = index < 6 ? index + 1 : 0;
  }
}
