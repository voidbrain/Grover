import { Component, Input } from '@angular/core';
import { PlantExtended } from '../../../../interfaces/plant';
import { RoomExtended } from '../../../../interfaces/room';

@Component({
  selector: 'app-log-panel',
  templateUrl: './log-panel.component.html',
  styleUrls: ['./log-panel.component.scss'],
})
export class LogPanelComponent {
  @Input() plant: PlantExtended;
  @Input() room: RoomExtended;
}
