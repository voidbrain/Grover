import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import { CommonModule } from '@angular/common';
import { IonItem, IonLabel, IonRadio } from '@ionic/angular/standalone';

@Component({
  selector: 'app-radio',
  styleUrls: ['radio.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonItem, IonLabel, IonRadio],
  template: `
    <ion-item lines="full" class="dynamic-field radio" [formGroup]="group">
      <ion-label color="primary">{{ config.label }}</ion-label>
      <ion-radio
        ngDefaultControl
        slot="start"
        value=""
        [formControlName]="config.name"
      ></ion-radio>
    </ion-item>
  `,
})
export class RadioComponent implements Field {
  config!: FieldConfig;
  group!: FormGroup;
}
