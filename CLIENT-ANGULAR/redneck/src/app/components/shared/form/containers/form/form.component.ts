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

@Component({
  exportAs: 'dynamicForm',
  standalone: true,
  
  selector: 'app-dynamic-form',
  styleUrls: ['form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule,
      DynamicFieldDirective,
      DynamicFormComponent,
      ButtonComponent,
      InputTextComponent,
      RadioComponent,
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
      <ng-container dynamicField [config]="field" [group]="form"> </ng-container>
    }
  </form>`,
})
export class DynamicFormComponent implements OnChanges, OnInit {
  @Input() config: FieldConfig[] = [];
  @Output() submitForm: EventEmitter<any> = new EventEmitter<any>();

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
          const config: any = this.config.find(
            (control) => control.name === name,
          );
          this.form.addControl(name, this.createControl(config));
        });
    }
  }

  createGroup() {
    const group = this.fb.group({});
    this.controls.forEach((control) =>
      group.addControl(control.name, this.createControl(control)),
    );
    return group;
  }

  createControl(config: FieldConfig) {
    const { disabled, validation, value } = config;
    return this.fb.control({ disabled, value }, validation);
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.submitForm.emit(this.value);
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

  setValue(name: string, value: any) {
    this.form.controls[name].setValue(value, { emitEvent: true });
  }

  setFormValues(form: any) {
    console.log(form, this.form)
    this.form.patchValue(form, { emitEvent: true });
  }
}
