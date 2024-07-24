/* eslint-disable @typescript-eslint/no-inferrable-types */

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.scss'],
  standalone: true,
  imports: []
})
export class RangeComponent implements OnChanges {
  @Input() minValue: number;
  @Input() maxValue: number;
  @Input() minWarningValue: number;
  @Input() maxWarningValue: number;
  @Input() value: number;
  @Input() um: string;

  percentValue: number;
  percentMinWarningValue: number;
  percentMaxWarningValue: number;

  chartConfig = {
    data: {},
    options: {},
    type: '',
  };

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if(
      changes.minValue &&
      changes.maxValue &&
      changes.minWarningValue &&
      changes.maxWarningValue
    ) { this.setup(); }
    if(changes.value) {
      this.percentValue = this.normalizeBetweenTwoRanges(this.value);
    }
  }

  setup() {
    this.percentValue = this.normalizeBetweenTwoRanges(this.value);
    this.percentMinWarningValue = this.normalizeBetweenTwoRanges(this.minWarningValue);
    this.percentMaxWarningValue = this.normalizeBetweenTwoRanges(this.maxWarningValue);
  }

  normalizeBetweenTwoRanges(val) {
    const minVal = this.minValue;
    const maxVal = this.maxValue;
    const normalizedMax = 100;
    const normalizedMin = 0;
    return normalizedMin + (val - minVal) * (normalizedMax - normalizedMin) / (maxVal - minVal);
  };
}
