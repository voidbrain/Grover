import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FieldConfig } from '../../../components/shared/form/models/field-config.interface';

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
})
export class FilterBarComponent {
  @Input() config: FieldConfig;
  @Output() emitChange: EventEmitter<any> = new EventEmitter<any>();

  updateSelection(event) {
    this.config.options.find(el => el.id === event.detail.value).isChecked = event.detail.checked;
    this.emitChange.emit(this.config);
  }
}
