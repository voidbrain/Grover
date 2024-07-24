import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges, } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonItem, IonLabel, IonSelect, IonSelectOption } from "@ionic/angular/standalone";

@Component({
  selector: 'app-input-select',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonLabel, IonItem, IonSelect, IonSelectOption],
  templateUrl: './input-select.component.html',
  styleUrl: './input-select.component.scss'
})
export class InputSelectComponent {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() minValue: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() maxValue: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() minWarningValue: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() maxWarningValue: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() um: any;

  chartConfig
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  percentValue: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  percentMinWarningValue: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  percentMaxWarningValue: any;

  constructor() {
    
    this.chartConfig = {
        data: {},
        options: {},
        type: '',
    };
}
ngOnChanges(changes: SimpleChanges) {
    if (changes["minValue"] &&
        changes["maxValue"] &&
        changes["minWarningValue"] &&
        changes["maxWarningValue"]) {
        this.setup();
    }
    if (changes["value"]) {
        this.percentValue = this.normalizeBetweenTwoRanges(this.value);
    }
}
setup() {
    this.percentValue = this.normalizeBetweenTwoRanges(this.value);
    this.percentMinWarningValue = this.normalizeBetweenTwoRanges(this.minWarningValue);
    this.percentMaxWarningValue = this.normalizeBetweenTwoRanges(this.maxWarningValue);
}
normalizeBetweenTwoRanges(val: number) {
    const minVal = this.minValue;
    const maxVal = this.maxValue;
    const normalizedMax = 100;
    const normalizedMin = 0;
    return normalizedMin + (val - minVal) * (normalizedMax - normalizedMin) / (maxVal - minVal);
}

}
