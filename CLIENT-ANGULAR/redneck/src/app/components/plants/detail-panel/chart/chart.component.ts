import { Component, Input, OnChanges } from '@angular/core';
import { SettingsService } from '../../../../../app/services/settings/settings.service';
import { PlantExtended } from '../../../../interfaces/plant';
import { RoomExtended } from '../../../../interfaces/room';
import { ChartComponent } from '../../../shared/chart/chart.component';
import { ProbesTypes } from '../../../../services/settings/enum';
import {
  format,
  setMinutes,
  startOfDay,
  startOfWeek,
  startOfMonth,
  parse,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

import { IonButton, IonLabel, IonSegment } from '@ionic/angular/standalone';

@Component({
  selector: 'app-detail-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  standalone: true,
  imports: [ChartComponent, IonButton, IonLabel, IonSegment],
})
export class PanelChartComponent implements OnChanges {
  @Input() plant: PlantExtended;
  @Input() room: RoomExtended;

  settings;
  chartConfig = {
    data: {},
    options: {},
    type: '',
  };

  data;

  dataArray = {
    labels: [],
    datasets: [],
  };

  ngOnChanges() {
    if (this.plant && this.plant !== undefined) {
      this.setup();
    }
  }

  setup() {
    this.settings = new SettingsService();
    const labels = new Set();

    this.room.workers?.map((item) => {
      if (item.log?.length) {
        const dataset = { borderColor: '#FF00FF', data: [], hidden: true };
        item.log.map((log) => {
          dataset.data.push({ t: new Date(log.executedTime), y: log.action });
        });
        item.log.map((log) => labels.add(log.executedTime));
        this.dataArray.datasets.push(dataset);
      }
    });
    this.room.probes?.map((item) => {
      if (item.log?.length) {
        const dataset = { borderColor: '#FFFF00', data: [], hidden: false };
        item.log.map((log) => {
          if (
            item.type.minAcceptableValue <= log.value &&
            log.value <= item.type.maxAcceptableValue
          ) {
            dataset.data.push({ t: log.executedTime, y: log.value });
          }
        });
        item.log.map((log) => labels.add(log.executedTime));
        this.dataArray.datasets.push(dataset);
      }
    });
    this.plant?.workers?.map((item) => {
      if (item.log.length) {
        const dataset = { borderColor: '#FFFFFF', data: [], hidden: true };
        item.log.map((log) => {
          dataset.data.push({ t: log.executedTime, y: log.action });
        });
        item.log.map((log) => labels.add(log.executedTime));
        this.dataArray.datasets.push(dataset);
      }
    });
    this.plant?.probes?.map((item) => {
      if (item.log.length) {
        const dataset = { borderColor: '#0000cc', data: [], hidden: false };
        item.log.map((log) => {
          if (
            item.type.minAcceptableValue <= log.value &&
            log.value <= item.type.maxAcceptableValue
          ) {
            dataset.data.push({ t: log.executedTime, y: log.value });
          }
        });
        item.log.map((log) => labels.add(log.executedTime));
        this.dataArray.datasets.push(dataset);
      }
    });

    const data = this.dataArray;
    data.labels = [...labels];
    this.data = data as any;

    this.filterData('beginning');
  }

  normalizeBetweenTwoRanges(val, minVal, maxVal) {
    const normalizedMax = 100;
    const normalizedMin = 0;
    return (
      normalizedMin +
      ((val - minVal) * (normalizedMax - normalizedMin)) / (maxVal - minVal)
    );
  }

  drawChart(filteredData) {
    const xMin = new Date(this.plant?.dayStartGrow).getTime();
    const xMax = setMinutes(new Date(), 0);

    const operationsArray = filteredData.datasets?.filter(
      (el) => el.hidden === true,
    );
    const annotationsArray = [];
    operationsArray.map((dataset) => {
      dataset.data.map((row) => {
        row.borderColor = dataset.borderColor;
        annotationsArray.push(row);
      });
    });

    const probeConfig = this.plant?.probes?.find(
      (el) => el.type.id === ProbesTypes.Water_temperature,
    );
    this.chartConfig = {
      type: 'line',
      data: filteredData,
      options: {
        plugins: {
          zoom: {
            pan: {
              enabled: true,
              mode: 'x',
              rangeMin: {
                x: xMin,
                y: null,
              },
              rangeMax: {
                x: xMax,
                y: null,
              },
            },
            zoom: {
              rangeMin: {
                x: xMin,
                y: null,
              },
              rangeMax: {
                x: xMax,
                y: null,
              },
              enabled: true,
              // drag: true,
              mode: 'x',
              // wheel: {
              //   enabled: true,
              // },
              // pinch: {
              //   enabled: true
              // },
            },
          },
        },
        responsive: true,
        maintainAspectRatio: true,

        legend: { display: false },
        elements: {
          line: { borderWidth: 1, tension: 0 },
          point: { radius: 1 },
        },
        tooltips: {
          callbacks: {
            title: () => {
              return;
            },
            label: (tooltipItem) => {
              const date = parse(
                tooltipItem.xlabel,
                'yyyy-MM-ddTHH:mm:ss.SSSxxx',
                new Date(),
              );
              const formattedDate = format(date, 'MMM dd HH:mm');
              const label = `${formattedDate} => ${tooltipItem.value} °C`;
              return label;
            },
          },
        },
        scales: {
          yAxes: [{ display: true }],
          xAxes: [
            {
              display: true,
              type: 'time',
              time: {
                displayFormats: {
                  millisecond: 'MMM DD HH:mm',
                  second: 'MMM DD HH:mm',
                  minute: 'MMM DD HH:mm',
                  hour: 'MMM DD HH:mm',
                  day: 'MMM DD HH:mm',
                  week: 'MMM DD HH:mm',
                  month: 'MMM DD YYYY HH:mm',
                  quarter: 'MMM DD YYYY HH:mm',
                  year: 'MMM DD YYYY HH:mm',
                },
              },
            },
          ],
        },
        annotation: {
          annotations: [
            /** safe area */
            {
              type: 'box',
              xMin: filteredData.labels[0],
              xMax: filteredData.labels[filteredData.labels.length - 1],
              yMax: this.plant?.phase?.minTemp,
              yMin: probeConfig?.minAcceptableValue,
              backgroundColor: 'rgba(255, 99, 132, 0.1)',
              borderColor: 'rgba(255, 99, 132, 0.1)',
              xScaleID: 'x-axis-0',
              yScaleID: 'y-axis-0',
            },
            {
              type: 'box',
              xMin: filteredData.labels[0],
              xMax: filteredData.labels[filteredData.labels.length - 1],
              yMax: this.plant?.phase?.maxTemp,
              yMin: this.plant?.phase?.minTemp,
              backgroundColor: 'rgba(47,223,117,0.1)',
              borderColor: 'rgba(255, 99, 132, 0.1)',
              xScaleID: 'x-axis-0',
              yScaleID: 'y-axis-0',
            },
            {
              type: 'box',
              xMin: filteredData.labels[0],
              xMax: filteredData.labels[filteredData.labels.length - 1],
              yMin: this.plant?.phase?.maxTemp,
              yMax: probeConfig?.maxAcceptableValue,
              backgroundColor: 'rgba(255, 99, 132, 0.1)',
              borderColor: 'rgba(15, 99, 132, 0.1)',
              xScaleID: 'x-axis-0',
              yScaleID: 'y-axis-0',
            },
            ...annotationsArray.map((data) => {
              return {
                type: 'box',
                borderColor: data.borderColor,
                backgroundColor: data.borderColor,
                borderWidth: 2,
                xScaleID: 'x-axis-0',
                yScaleID: 'y-axis-0',
                xMin: data.t,
                xMax: data.t,
                yMin: 20,
                yMax: 20.4,
              };
            }),
          ],
        },
      },
    };
    // console.log(this.chartConfig)
  }

  filterDates(fromDate, toDate) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const filteredData = JSON.parse(JSON.stringify(self.data));
    filteredData['datasets'].map((dataset) => {
      dataset.data = dataset['data']?.filter((item: any) => {
        return (
          new Date(item.t).getTime() >= new Date(fromDate).getTime() &&
          new Date(item.t).getTime() <= new Date(toDate).getTime()
        );
      });
    });
    filteredData['labels'] = [...filteredData['labels']].filter(
      (label: any) => {
        return (
          new Date(label).getTime() >= new Date(fromDate).getTime() &&
          new Date(label).getTime() <= new Date(toDate).getTime()
        );
      },
    );
    const zonedDateFrom = toZonedTime(fromDate, 'UTC');
    const zonedDateTo = toZonedTime(toDate, 'UTC');
    const formattedDateFrom = format(
      zonedDateFrom,
      "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
    );
    const formattedDateTo = format(zonedDateTo, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    filteredData['labels'].unshift(formattedDateFrom);
    filteredData['labels'].push(formattedDateTo);
    this.drawChart(filteredData);
  }

  filterData(period) {
    const now = setMinutes(new Date(), 0);
    switch (period) {
      case 'day':
        this.filterDates(startOfDay(new Date()), now);
        break;
      case 'week':
        this.filterDates(startOfWeek(new Date()), now);
        break;
      case 'month':
        this.filterDates(startOfMonth(new Date()), now);
        break;
      case 'beginning':
        this.filterDates(this.plant?.dayStartGrow, now);
        break;
    }
  }
}
