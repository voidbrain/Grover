import { Component, Input } from '@angular/core';
import { PlantExtended } from '../../../../interfaces/plant';
import { RoomExtended } from '../../../../interfaces/room';

@Component({
  selector: 'app-detail-table',
  templateUrl: './table.component.html',
  standalone: true,
  imports: [],
  styleUrls: ['./table.component.scss'],
})
export class PanelTableComponent {
  @Input() plant: PlantExtended;
  @Input() room: RoomExtended;
  @Input() tableValues: any[] = [];
}
