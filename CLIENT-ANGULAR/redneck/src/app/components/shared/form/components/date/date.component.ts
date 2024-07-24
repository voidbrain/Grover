import { ViewChild, Input, Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IonDatetime } from '@ionic/angular';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';

@Component({
  selector: 'app-date',
  styleUrls: ['date.component.scss'],
  template: `
    <ion-item class="dynamic-field date" [formGroup]="group">

    <ion-label color="primary">{{ config.label }}</ion-label>
     <ion-input slot="end"
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
