import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';

@Component({
  selector: 'app-checkbox',
  styleUrls: ['checkbox.component.scss'],
  template: `
    <div class="dynamic-field app-input-select" [formGroup]="group">
      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-label color="primary">{{ config.label }}</ion-label>
          </ion-col>
          <ion-col *ngFor="let option of config.options">
            <ion-checkbox [checked]="option.isChecked" [value]="option.id"></ion-checkbox>
            <ion-label color="primary">{{ option.name }}</ion-label>
          </ion-col>
        </ion-row>
      </ion-grid>
    </div>
  `,
})
export class CheckboxComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
