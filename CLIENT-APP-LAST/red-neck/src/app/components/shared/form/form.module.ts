import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DynamicFieldDirective } from './components/dynamic-field/dynamic-field.directive';
import { DynamicFormComponent } from './containers/form/form.component';
import { ButtonComponent } from './components/button/button.component';
import { InputTextComponent } from './components/input-text/input-text.component';
import { RadioComponent } from './components/radio/radio.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { DateComponent } from './components/date/date.component';
import { ToggleComponent } from './components/toggle/toggle.component';
import { RangeComponent } from './components/range/range.component';
import { InputHiddenComponent } from './components/input-hidden/input-hidden.component';
import { SelectComponent } from './components/select/select.component';

@NgModule({
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  declarations: [
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
  exports: [DynamicFormComponent],
  entryComponents: [
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
})
export class DynamicFormModule {}
