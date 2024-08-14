export interface TypeLog { executedTime: string; value?: number; action?: number }
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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

// Define the shape of the data structure
interface DataEl {
  t: Date | string;
  y: number | string;
}

interface Dataset {
  borderColor: string;
  data: DataEl[];
  hidden: boolean;
}

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

  dataArray: {
    labels: string[];
    datasets: Dataset[];
  } = { labels: [], datasets: [] };

  data?: {
    labels: string[];
    datasets: Dataset[];
  };

  public chartData?: ChartConfiguration['data'];
  public chartOptions?: ChartOptions;
  public chartType?: ChartType;
  public chartConfig?: ChartConfiguration;

  constructor() {
    Chart.register(...registerables, annotationPlugin, zoomPlugin);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['plant'] || changes['room']) {
      this.setup();
    }
  }

  setup() {
    const labels = new Set<string>();
    
    // const processLogs = (logs: { executedTime: string; value?: number; action?: number }[], color: string, minValue?: number, maxValue?: number): Dataset => {
      const processLogs = (logs: TypeLog[], color: string, minValue?: number, maxValue?: number): Dataset => {
      const dataset: Dataset = { borderColor: color, data: [], hidden: false };
      logs.forEach(log => {
        const value = log.value ?? log.action;
        if (minValue !== undefined && maxValue !== undefined) {
          if (value !== undefined && value >= minValue && value <= maxValue) {
            dataset.data.push({ t: log.executedTime, y: value });
          }
        } else {
          if (value !== undefined) {
            dataset.data.push({ t: log.executedTime, y: value });
          }
        }
        labels.add(log.executedTime);
      });
      return dataset;
    };

    if (this.room?.workers) {
      this.dataArray.datasets.push(
        ...this.room.workers.map(worker => worker.log?.length ? processLogs(worker.log as unknown as TypeLog[], '#FF00FF') : { borderColor: '#FF00FF', data: [], hidden: true })
      );
    }

    if (this.room?.probes) {
      this.dataArray.datasets.push(
        ...this.room.probes.map(probe => probe.log?.length ? processLogs(probe.log as unknown as TypeLog[], '#FFFF00', probe.probeEl?.minAcceptableValue, probe.probeEl?.maxAcceptableValue) : { borderColor: '#FFFF00', data: [], hidden: false })
      );
    }

    if (this.plant?.workers) {
      this.dataArray.datasets.push(
        ...this.plant.workers.map(worker => worker.log?.length ? processLogs(worker.log as unknown as TypeLog[], '#FFFFFF') : { borderColor: '#FFFFFF', data: [], hidden: true })
      );
    }

    if (this.plant?.probes) {
      this.dataArray.datasets.push(
        ...this.plant.probes.map(probe => probe.log?.length ? processLogs(probe.log as unknown as TypeLog[], '#0000cc', probe.probeEl?.minAcceptableValue, probe.probeEl?.maxAcceptableValue) : { borderColor: '#0000cc', data: [], hidden: false })
      );
    }

    this.dataArray.labels = [...labels];
    this.data = this.dataArray;

    this.filterData('beginning');
  }

  normalizeBetweenTwoRanges(val: number, minVal: number, maxVal: number): number {
    const normalizedMax = 100;
    const normalizedMin = 0;
    return (
      normalizedMin +
      ((val - minVal) * (normalizedMax - normalizedMin)) / (maxVal - minVal)
    );
  }

  drawChart(filteredData: { labels: string[], datasets: Dataset[] }) {
    const xMin = new Date(+(this.plant?.dayStartGrow ?? 0));
    const xMax = new Date(setMinutes(new Date(), 0));

    const operationsArray = filteredData.datasets.filter(
      (dataset) => dataset.hidden === true
    );
    const annotationsArray = operationsArray.flatMap(dataset =>
      dataset.data.map(row => ({
        ...row,
        borderColor: dataset.borderColor
      }))
    );

    const probeConfig = this.plant?.probes?.find(
      (el) => el?.probeEl?.id === ProbesTypes.Water_temperature
    );

    this.chartType = 'line';

    const chartOptions: ChartOptions = {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: () => '',
            label: (tooltipItem) => {
              const date = parse(
                tooltipItem.label,
                'yyyy-MM-ddTHH:mm:ss.SSSxxx',
                new Date()
              );
              const formattedDate = format(date, 'MMM dd HH:mm');
              return `${formattedDate} => ${tooltipItem.raw} °C`;
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
              yMin: probeConfig?.probeEl?.minAcceptableValue,
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
              yMax: probeConfig?.probeEl?.maxAcceptableValue,
              backgroundColor: 'rgba(255, 99, 132, 0.1)',
              borderColor: 'rgba(15, 99, 132, 0.1)',
              xScaleID: 'x-axis-0',
              yScaleID: 'y-axis-0',
            } as BoxAnnotationOptions,
            ...annotationsArray.map(data => ({
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
            } as BoxAnnotationOptions))
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
      data: filteredData as unknown as ChartConfiguration["data"],
      options: chartOptions,
    };
  }

  filterDates(fromDate: number | string, toDate: number | string) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const filteredData = { ...this.data };
    if (filteredData) {
      filteredData.datasets = filteredData.datasets?.map(dataset => ({
        ...dataset,
        data: dataset.data.filter(item => {
          const date = new Date(item.t);
          return date.getTime() >= from.getTime() && date.getTime() <= to.getTime();
        }),
      }));
      filteredData.labels = filteredData.labels?.filter(label => {
        const date = new Date(label);
        return date.getTime() >= from.getTime() && date.getTime() <= to.getTime();
      });
      const zonedDateFrom = toZonedTime(fromDate, 'UTC');
      const zonedDateTo = toZonedTime(toDate, 'UTC');
      const formattedDateFrom = format(zonedDateFrom, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
      const formattedDateTo = format(zonedDateTo, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
      filteredData.labels?.unshift(formattedDateFrom);
      filteredData.labels?.push(formattedDateTo);
      this.drawChart(filteredData);
    }
  }

  filterData(period: string) {
    const now = setMinutes(new Date(), 0);
    switch (period) {
      case 'day':
        this.filterDates(startOfDay(new Date()).toString(), now.toString());
        break;
      case 'week':
        this.filterDates(startOfWeek(new Date()).toString(), now.toString());
        break;
      case 'month':
        this.filterDates(startOfMonth(new Date()).toString(), now.toString());
        break;
      case 'beginning':
        this.filterDates(this.plant?.dayStartGrow ?? now.toString(), now.toString());
        break;
    }
  }
}
