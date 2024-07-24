import { ValidatorFn } from '@angular/forms';

interface Options {
  id: number;
  name: string;
  isChecked?: boolean;
}

export interface FieldConfig {
  disabled?: boolean;
  label?: string;
  name: string;
  options?: Options[];
  placeholder?: string;
  type: string;
  validation?: ValidatorFn[];
  value?: any;
  min?: number;
  max?: number;
  icon?: string;
  multiple?: boolean;
}
