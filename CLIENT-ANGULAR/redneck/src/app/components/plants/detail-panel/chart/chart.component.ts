import { Component, Input, OnChanges } from '@angular/core';
import { SettingsService } from '../../../../../app/services/settings/settings.service';
import { PlantExtendedInterface } from '../../../../interfaces/plant';
import { RoomExtendedInterface } from '../../../../interfaces/room';
import { ChartComponent } from '../../../shared/chart/chart.component';
import { ProbesTypes } from '../../../../services/settings/enum';
import {
  Chart,
  ChartConfiguration,
  ChartOptions,
  ChartType,
  registerables,
} from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import { BoxAnnotationOptions } from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';

import {
  format,
  setMinutes,
  startOfDay,
  startOfWeek,
  startOfMonth,
  parse,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

import {
  IonLabel,
  IonSegment,
  IonSegmentButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-detail-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  standalone: true,
  imports: [ChartComponent, IonLabel, IonSegment, IonSegmentButton],
})
export class PanelChartComponent implements OnChanges {
  @Input() plant?: PlantExtendedInterface;
  @Input() room?: RoomExtendedInterface;

  settings;
  data;

  dataArray = {
    labels: [],
    datasets: [],
  };

  constructor() {
    Chart.register(...registerables, annotationPlugin, zoomPlugin);
  }

  public chartData?: ChartConfiguration['data'];

  // Sample options for the chart
  public chartOptions?: ChartOptions;

  // Chart type
  public chartType?: ChartType;

  // Complete chart configuration
  public chartConfig?: ChartConfiguration;

  ngOnChanges() {
    if (this.plant && this.plant !== undefined) {
      this.setup();
    }
  }

  setup() {
    this.settings = new SettingsService();
    const labels = new Set();
    
    this.room?.workers?.map((item) => {
      if (item.log?.length) {
        const dataset = { borderColor: '#FF00FF', data: [], hidden: true };
        item.log.map((log) => {
          dataset.data.push({ t: new Date(log.executedTime), y: log.action });
        });
        item.log.map((log) => labels.add(log.executedTime));
        this.dataArray.datasets.push(dataset);
      }
    });
    this.room?.probes?.map((item) => {
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
    this.data = data;

    this.filterData('beginning');
  }

  normalizeBetweenTwoRanges(val: number, minVal: number, maxVal: number) {
    const normalizedMax = 100;
    const normalizedMin = 0;
    return (
      normalizedMin +
      ((val - minVal) * (normalizedMax - normalizedMin)) / (maxVal - minVal)
    );
  }

  drawChart(filteredData) {
    const xMin = new Date(this.plant?.dayStartGrow);
    const xMax = new Date(setMinutes(new Date(), 0));

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
      (el) => el?.type?.id === ProbesTypes.Water_temperature,
    );

    this.chartType = 'line';

    const chartOptions: ChartOptions = {
      plugins: {
        legend: { display: false },

        tooltip: {
          callbacks: {
            title: () => {
              return;
            },
            label: (tooltipItem) => {
              const date = parse(
                tooltipItem.label,
                'yyyy-MM-ddTHH:mm:ss.SSSxxx',
                new Date(),
              );
              const formattedDate = format(date, 'MMM dd HH:mm');
              const label = `${formattedDate} => ${tooltipItem.raw} °C`;
              return label;
            },
          },
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
            } as BoxAnnotationOptions,
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
            } as BoxAnnotationOptions,
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
            } as BoxAnnotationOptions,

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
              } as BoxAnnotationOptions;
            }),
          ],
        },

        zoom: {
          limits: {
            x: { min: xMin.getTime(), max: xMax.getTime() },
            y: { min: undefined, max: undefined },
          },
          pan: {
            enabled: true,
            mode: 'x',
          },
          zoom: {
            mode: 'x',
          },
        },
      },

      responsive: true,
      maintainAspectRatio: true,

      elements: {
        line: { borderWidth: 1, tension: 0 },
        point: { radius: 1 },
      },

      scales: {
        y: {
          ticks: {
            display: true,
          },
        },
        x: {
          // type: 'time',
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
          ticks: {
            display: true,
          },
        },
      },
    };

    this.chartConfig = {
      type: this.chartType,
      data: filteredData,
      options: chartOptions,
    };
  }

  filterDates(fromDate: number | string, toDate: number | string) {
    const filteredData = JSON.parse(JSON.stringify(this.data));
    filteredData['datasets'].map((dataset) => {
      dataset.data = dataset['data']?.filter((item) => {
        return (
          new Date(item.t).getTime() >= new Date(fromDate).getTime() &&
          new Date(item.t).getTime() <= new Date(toDate).getTime()
        );
      });
    });
    filteredData['labels'] = [...filteredData['labels']].filter(
      (label) => {
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

  filterData(period: string) {
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
