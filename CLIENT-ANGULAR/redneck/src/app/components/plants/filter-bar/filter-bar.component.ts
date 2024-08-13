import { FormDefinition } from '../../../interfaces/utils';

import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCheckbox,
  IonLabel,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [
    IonLabel,
    IonCheckbox,
    IonCol,
    IonRow,
    IonGrid,
    IonCardContent,
    IonCard,
  ],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss',
})


export class FilterBarComponent {
  @Input() config!: FormDefinition;
  @Output() emitChange = new EventEmitter<FormDefinition>();

  updateSelection(event: CustomEvent) {
    const { value, checked } = event.detail;
    const updatedOptions = this.config.options.map(option =>
      option.id === value ? { ...option, isChecked: checked } : option
    );

    this.emitChange.emit({ ...this.config, options: updatedOptions });
  }
}
