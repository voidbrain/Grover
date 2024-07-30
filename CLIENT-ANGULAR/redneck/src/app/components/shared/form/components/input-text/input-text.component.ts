import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import { CommonModule } from '@angular/common';
import { IonLabel, IonInput, IonItem } from '@ionic/angular/standalone';

@Component({
  selector: 'app-input-text',
  styleUrls: ['input-text.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonLabel, IonInput, IonItem],
  template: `
    <ion-item class="dynamic-field input-text" [formGroup]="group">
      <ion-label color="primary">{{ config.label }}</ion-label>
      <ion-input
        [type]="config.type"
        [formControlName]="config.name"
        ngDefaultControl
      ></ion-input>
    </ion-item>
  `,
})
export class InputTextComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
