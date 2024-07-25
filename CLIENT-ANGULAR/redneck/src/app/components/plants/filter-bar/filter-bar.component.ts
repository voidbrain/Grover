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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() config: any;
  @Output() emitChange = new EventEmitter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateSelection(event: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.config.options.find(
      (el: any) => el.id === event.detail.value,
    ).isChecked = event.detail.checked;
    this.emitChange.emit(this.config);
  }
}
