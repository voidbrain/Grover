import {
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  Input,
  OnChanges,
  OnInit,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ButtonComponent } from '../button/button.component';
import { InputTextComponent } from '../input-text/input-text.component';
import { RadioComponent } from '../radio/radio.component';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { ToggleComponent } from '../toggle/toggle.component';
import { RangeComponent } from '../range/range.component';
import { InputHiddenComponent } from '../input-hidden/input-hidden.component';
import { SelectComponent } from '../select/select.component';
import { DateComponent } from '../date/date.component';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';

const components: Record<string, Type<Field>> = {
  text: InputTextComponent,
  password: InputTextComponent,
  email: InputTextComponent,
  number: InputTextComponent,
  search: InputTextComponent,
  tel: InputTextComponent,

  button: ButtonComponent,
  radio: RadioComponent,
  checkbox: CheckboxComponent,
  toggle: ToggleComponent,
  range: RangeComponent,
  hidden: InputHiddenComponent,
  inputSelect: SelectComponent,
  date: DateComponent,
};

@Directive({
  selector: '[appDynamicField]',
  standalone: true,
})
export class DynamicFieldDirective implements Field, OnChanges, OnInit {
  @Input() config: FieldConfig;
  @Input() group: FormGroup;

  component: ComponentRef<Field>;

  constructor(
    private resolver: ComponentFactoryResolver,
    private container: ViewContainerRef,
  ) {}

  ngOnChanges() {
    if (this.component) {
      this.component.instance.config = this.config;
      this.component.instance.group = this.group;
    }
  }

  ngOnInit() {
    if (!components[this.config.type]) {
      const supportedTypes = Object.keys(components).join(', ');
      throw new Error(
        `Trying to use an unsupported type (${this.config.type}). Supported types: ${supportedTypes}`,
      );
    }
    const component = this.resolver.resolveComponentFactory<Field>(
      components[this.config.type],
    );
    this.component = this.container.createComponent(component);
    this.component.instance.config = this.config;
    this.component.instance.group = this.group;
  }
}
