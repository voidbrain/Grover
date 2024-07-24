import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';

@Component({
  selector: 'app-input-text',
  styleUrls: ['input-text.component.scss'],
  template: `
    <ion-item class="dynamic-field input-text" [formGroup]="group">
      <ion-label color="primary">{{ config.label }}</ion-label>
      <ion-input
        [type]="config.type"
        [formControlName]="config.name"
      ></ion-input>
    </ion-item>
  `,
})
export class InputTextComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
