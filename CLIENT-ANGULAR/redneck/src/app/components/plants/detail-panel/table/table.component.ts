import { Component, Input } from '@angular/core';
import { PlantExtendedInterface } from '../../../../interfaces/plant';
import { RoomExtendedInterface } from '../../../../interfaces/room';

@Component({
  selector: 'app-detail-table',
  templateUrl: './table.component.html',
  standalone: true,
  imports: [],
  styleUrls: ['./table.component.scss'],
})
export class PanelTableComponent {
  @Input() plant?: PlantExtendedInterface;
  @Input() room?: RoomExtendedInterface;
  @Input() tableValues: unknown[] = [];
  valuesArr:[] = []
}
