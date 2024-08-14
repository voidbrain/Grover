import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { DynamicFieldDirective } from './../../components/dynamic-field/dynamic-field.directive';
import { ButtonComponent } from './../../components/button/button.component';
import { InputTextComponent } from './../../components/input-text/input-text.component';
import { RadioComponent } from './../../components/radio/radio.component';
import { CheckboxComponent } from './../../components/checkbox/checkbox.component';
import { DateComponent } from './../../components/date/date.component';
import { ToggleComponent } from './../../components/toggle/toggle.component';
import { RangeComponent } from './../../components/range/range.component';
import { InputHiddenComponent } from './../../components/input-hidden/input-hidden.component';
import { SelectComponent } from './../../components/select/select.component';

import { FieldConfig } from '../../models/field-config.interface';
import { CompanyInterface } from '../../../../../interfaces/company';
import { DoseInterface } from '../../../../../interfaces/dose';
import { PlantInterface } from '../../../../../interfaces/plant';
import { FormDefinitionRow } from '../../../../../interfaces/form-definition'; // Corrected Typo

@Component({
  exportAs: 'dynamicForm',
  standalone: true,
  selector: 'app-dynamic-form',
  styleUrls: ['form.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicFieldDirective,
    ButtonComponent,
    InputTextComponent,
    RadioComponent,
    CheckboxComponent,
    DateComponent,
    ToggleComponent,
    RangeComponent,
    InputHiddenComponent,
    SelectComponent,
  ],
  template: `<form
    class="dynamic-form"
    [formGroup]="form"
    (submit)="handleSubmit($event)"
  >
  @for (field of config; track field) {
    <ng-container>
      <ng-container appDynamicField [config]="transformToFieldConfig(field)" [group]="form">
      </ng-container>
    </ng-container>
  }
  </form>`,
})
export class DynamicFormComponent implements OnChanges, OnInit {
  @Input() config: FormDefinitionRow[] = [];
  @Output() submitForm: EventEmitter<CustomEvent> = new EventEmitter<CustomEvent>();

  form: FormGroup = new FormGroup({});

  get controls() {
    return this.config.filter(({ type }) => type !== 'button');
  }
  get changes() {
    return this.form.valueChanges;
  }
  get valid() {
    return this.form.valid;
  }
  get value() {
    return this.form.value;
  }

  constructor(private fb: FormBuilder) {}

  transformToFieldConfig(row: FormDefinitionRow): FieldConfig {
    return {
      type: row.type,
      name: row.name,
      label: row.label,
      
      disabled: row.disabled,
      
      options: row.options,
    };
  }

  ngOnInit() {
    this.form = this.createGroup();
  }

  ngOnChanges() {
    if (this.form) {
      const controls = Object.keys(this.form.controls);
      const configControls = this.controls.map((item) => item.name);

      controls
        .filter((control) => !configControls.includes(control))
        .forEach((control) => this.form.removeControl(control));

      configControls
        .filter((control) => !controls.includes(control))
        .forEach((name) => {
          const config = this.config.find(
            (control) => control.name === name,
          );
          if (config) {
            this.form.addControl(name, this.createControl(config as unknown as FieldConfig));
          }
        });
    }
  }

  createGroup() {
    const group = this.fb.group({});
    this.controls.forEach((control) =>
      group.addControl(control.name, this.createControl(control as unknown as FieldConfig)),
    );
    return group;
  }

  createControl(config: FieldConfig) {
    const { disabled, validation, value } = config;
    return this.fb.control({ value, disabled }, validation || []);
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.valid) {
      this.submitForm.emit(this.value);
    }
  }

  setDisabled(name: string, disable: boolean) {
    if (this.form.controls[name]) {
      const method = disable ? 'disable' : 'enable';
      this.form.controls[name][method]();
      return;
    }
    this.config = this.config.map((item) => {
      if (item.name === name) {
        item.disabled = disable;
      }
      return item;
    });
  }

  setValue(name: string, value: string | number | []) {
    this.form.controls[name].setValue(value, { emitEvent: true });
  }

  setFormValues(form: PlantInterface | CompanyInterface | DoseInterface) {
    if (form && this.form) {
      this.form.patchValue(form, { emitEvent: true });
    }
  }


}
