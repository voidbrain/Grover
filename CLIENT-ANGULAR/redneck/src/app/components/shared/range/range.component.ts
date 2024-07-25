import { Component, Input, OnChanges } from '@angular/core';
import { IonItem, IonLabel, IonBadge, IonRange, IonIcon } from "@ionic/angular/standalone";
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.scss'],
  standalone: true,
  imports: [IonIcon, IonRange, IonBadge, IonLabel, IonItem, ReactiveFormsModule]
})
export class RangeComponent implements OnChanges {
  @Input() minValue!: number;
  @Input() maxValue!: number;
  @Input() minWarningValue!: number;
  @Input() maxWarningValue!: number;
  @Input() value!: number;
  @Input() um!: string;

  percentValue!: number;
  percentMinWarningValue!: number;
  percentMaxWarningValue!: number;

  chartConfig = {
    data: {},
    options: {},
    type: '',
  };

  ngOnChanges() {
    if(
      this.minValue &&
      this.maxValue &&
      this.minWarningValue &&
      this.maxWarningValue
    ) { this.setup(); }
    if(this.value) {
      this.percentValue = this.normalizeBetweenTwoRanges(this.value);
    }
  }

  setup() {
    this.percentValue = this.normalizeBetweenTwoRanges(this.value);
    this.percentMinWarningValue = this.normalizeBetweenTwoRanges(this.minWarningValue);
    this.percentMaxWarningValue = this.normalizeBetweenTwoRanges(this.maxWarningValue);
  }

  normalizeBetweenTwoRanges(val: any) {
    const minVal = this.minValue;
    const maxVal = this.maxValue;
    const normalizedMax = 100;
    const normalizedMin = 0;
    return normalizedMin + (val - minVal) * (normalizedMax - normalizedMin) / (maxVal - minVal);
  };
}
