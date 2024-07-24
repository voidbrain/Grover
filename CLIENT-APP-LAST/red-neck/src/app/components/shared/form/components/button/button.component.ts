import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';

@Component({
  selector: 'app-button',
  styleUrls: ['button.component.scss'],
  template: `
    <div class="dynamic-field button" [formGroup]="group">
      <ion-button
        color="primary"
        expand="block"
        [disabled]="config.disabled"
        type="submit"
      >
        {{ config.label }}
      </ion-button>
    </div>
  `,
})
export class ButtonComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
