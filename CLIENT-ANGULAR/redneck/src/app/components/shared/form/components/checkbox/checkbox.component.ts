import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import {
  IonCheckbox,
  IonCol,
  IonGrid,
  IonLabel,
  IonRow,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-checkbox',
  styleUrls: ['checkbox.component.scss'],
  imports: [
    IonCheckbox,
    IonCol,
    IonGrid,
    IonLabel,
    IonRow,
    FormsModule,
    ReactiveFormsModule,
  ],
  standalone: true,
  template: `
    <div class="dynamic-field app-input-select" [formGroup]="group">
      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-label color="primary">{{ config.label }}</ion-label>
          </ion-col>

          @for (option of config.options; track option) {
            <ion-col>
              <ion-checkbox
                [checked]="option.isChecked"
                [value]="option.id"
              ></ion-checkbox>
              <ion-label color="primary">{{ option.name }}</ion-label>
            </ion-col>
          }
        </ion-row>
      </ion-grid>
    </div>
  `,
})
export class CheckboxComponent implements Field {
  config!: FieldConfig;
  group!: FormGroup;
}
