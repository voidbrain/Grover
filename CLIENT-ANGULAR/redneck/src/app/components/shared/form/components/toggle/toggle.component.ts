import { Component, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';

@Component({
  selector: 'app-toggle',
  styleUrls: ['toggle.component.scss'],
  template: `
    <ion-item lines="full" class="dynamic-field toggle" [formGroup]="group">
      <ion-label color="primary">{{ config.label }}</ion-label>
      <ion-toggle slot="end" [formControlName]="config.name"></ion-toggle>
    </ion-item>
  `,
})
export class ToggleComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
