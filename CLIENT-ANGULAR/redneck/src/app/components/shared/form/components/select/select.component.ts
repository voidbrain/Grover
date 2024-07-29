import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-input-select',
  styleUrls: ['select.component.scss'],
  standalone: true,
  imports: [IonItem, IonLabel, IonSelect, IonSelectOption, ReactiveFormsModule],
  template: `
    <ion-item class="dynamic-field app-input-select" [formGroup]="group">
      <ion-label color="primary">{{ config.label }}</ion-label>
      <ion-select
        multiple="{{ config.multiple }}"
        [formControlName]="config.name"
        ngDefaultControl
      >
        @for (option of config.options; track option) {
          <ion-select-option [value]="option.id">
            {{ option.name }}
          </ion-select-option>
        }
      </ion-select>
    </ion-item>
  `,
})
export class SelectComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
