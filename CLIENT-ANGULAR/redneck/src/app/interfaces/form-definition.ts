import { Validators } from "@angular/forms";
import { StrainInterface } from "./strain";
import { CompanyInterface } from "./company";
import { PotInterface } from "./pot";

export interface FomrDefinitionRow {
  name: string,
  type: string,
  label: string,
  validation?: Validators[],
  options?: (StrainInterface | CompanyInterface | PotInterface)[],
  min?: number,
  max?: number,
  icon?: string,
  multiple?: boolean

} 