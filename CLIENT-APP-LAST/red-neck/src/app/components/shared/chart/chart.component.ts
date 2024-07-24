/* eslint-disable @typescript-eslint/no-inferrable-types */

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent {
  @Input() type: string = '';
  @Input() data: any = '';
  @Input() options: any = '';
  @Input() legend: any = '';

  constructor() {}
}
