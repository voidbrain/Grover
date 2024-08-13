export interface FormDefinitionRow { 
    id: number, 
    isChecked: boolean, 
    name: string 
}


export interface FormDefinition {
    name: string,
        type: string,
        label: string,
        options: FormDefinitionRow[],
        multiple: true,
  }

  export interface FormDefinitionResponse extends FormDefinition {
    options: FormDefinitionRow[]
  }
  
  export interface HTMLResponse {
    value: string;
    error?: string;
    mode: string
  }