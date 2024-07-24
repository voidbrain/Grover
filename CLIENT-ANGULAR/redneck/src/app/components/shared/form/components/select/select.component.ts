import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';

@Component({
  selector: 'app-input-select',
  styleUrls: ['select.component.scss'],
  template: `
    <ion-item class="dynamic-field app-input-select" [formGroup]="group">
      <ion-label color="primary">{{ config.label }}</ion-label>
      <ion-select
        multiple="{{ config.multiple }}"
        [formControlName]="config.name"
      >
        <ion-select-option
          *ngFor="let option of config.options"
          [value]="option.id"
        >
          {{ option.name }}
        </ion-select-option>
      </ion-select>
    </ion-item>
  `,
})
export class SelectComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
