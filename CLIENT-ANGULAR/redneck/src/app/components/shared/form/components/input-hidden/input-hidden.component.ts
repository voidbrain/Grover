import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input-hidden',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['input-hidden.component.scss'],
  template: ` <div class="dynamic-field input-hidden" [formGroup]="group">
    <input ngDefaultControl type="hidden" [formControlName]="config.name" />
  </div>`,
})
export class InputHiddenComponent implements Field {
  config!: FieldConfig;
  group!: FormGroup;
}
