import { ViewChild, Input, Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  IonDatetime,
  IonItem,
  IonLabel,
  IonRadio,
} from '@ionic/angular/standalone';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-date',
  styleUrls: ['date.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonDatetime,
    IonItem,
    IonLabel,
    IonRadio,
  ],
  template: `
    <ion-item class="dynamic-field date" [formGroup]="group">
      <ion-label color="primary">{{ config.label }}</ion-label>
      <ion-input
        ngDefaultControl
        slot="end"
        type="date"
        [formControlName]="config.name"
      ></ion-input>
    </ion-item>
  `,
})
export class DateComponent implements Field {
  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  @Input() config: FieldConfig;
  @Input() group: FormGroup;
  dateValue = '';
}
