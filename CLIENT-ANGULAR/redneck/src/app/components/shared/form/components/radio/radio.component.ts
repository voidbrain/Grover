import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';

@Component({
  selector: 'app-radio',
  styleUrls: ['radio.component.scss'],
  template: `
    <ion-item lines="full" class="dynamic-field radio" [formGroup]="group">
      <ion-label color="primary">{{ config.label }}</ion-label>
      <ion-radio
        slot="start"
        value=""
        [formControlName]="config.name"
      ></ion-radio>
    </ion-item>
  `,
})
export class RadioComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
