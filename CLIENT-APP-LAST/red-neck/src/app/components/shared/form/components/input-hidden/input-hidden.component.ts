import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';

@Component({
  selector: 'app-input-hidden',
  styleUrls: ['input-hidden.component.scss'],
  template: ` <div class="dynamic-field input-hidden" [formGroup]="group">
    <input type="hidden" [formControlName]="config.name" />
  </div>`,
})
export class InputHiddenComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
