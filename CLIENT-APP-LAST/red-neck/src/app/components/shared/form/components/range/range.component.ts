import { Component, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';

@Component({
  selector: 'app-range',
  styleUrls: ['range.component.scss'],
  template: `
    <ion-item lines="full" class="dynamic-field range" [formGroup]="group">
      <ion-label color="primary">{{ config.label }}</ion-label>
      <ion-badge item-end>{{ group.controls[config.name].value }}</ion-badge>
      <ion-range
        min="{{ config.min }}"
        max="{{ config.max }}"
        [formControlName]="config.name"
      >
        <ion-icon size="small" slot="start" name="{{ config.icon }}"></ion-icon>
        <ion-icon slot="end" name="{{ config.icon }}"></ion-icon>
      </ion-range>
    </ion-item>
  `,
})
export class RangeComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
