interface FilterOption {
  id: string;
  label: string;
  isChecked: boolean;
  name: string;
}

// Define the interface for the configuration input
interface FilterBarConfig {
  options: FilterOption[];
}

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
  @Input() config!: FilterBarConfig;
  @Output() emitChange = new EventEmitter<FilterBarConfig>();

  updateSelection(event: CustomEvent) {
    const { value, checked } = event.detail;
    const updatedOptions = this.config.options.map(option =>
      option.id === value ? { ...option, isChecked: checked } : option
    );

    this.emitChange.emit({ ...this.config, options: updatedOptions });
  }
}
