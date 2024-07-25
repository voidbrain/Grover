import { Component, Input } from '@angular/core';
import { PanelChartComponent } from '../chart/chart.component'
import { PlantExtended } from '../../../../interfaces/plant';
import { RoomExtended } from '../../../../interfaces/room';

@Component({
  selector: 'app-log-panel',
  standalone: true,
  imports: [PanelChartComponent],
  templateUrl: './log-panel.component.html',
  styleUrl: './log-panel.component.scss'
})
export class LogPanelComponent {
  @Input() plant!: PlantExtended;
  @Input() room!: RoomExtended;
}
