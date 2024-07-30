import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import { IonItem, IonLabel, IonToggle } from '@ionic/angular/standalone';

@Component({
  selector: 'app-toggle',
  styleUrls: ['toggle.component.scss'],
  standalone: true,
  imports: [IonItem, IonLabel, IonToggle, ReactiveFormsModule],
  template: `
    <ion-item lines="full" class="dynamic-field toggle" [formGroup]="group">
      <ion-label color="primary">{{ config.label }}</ion-label>
      <ion-toggle
        slot="end"
        ngDefaultControl
        [formControlName]="config.name"
      ></ion-toggle>
    </ion-item>
  `,
})
export class ToggleComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
