import { Component, Input } from '@angular/core';
import { PanelChartComponent } from '../chart/chart.component';
import { PlantExtendedInterface } from '../../../../interfaces/plant';
import { RoomExtendedInterface } from '../../../../interfaces/room';

@Component({
  selector: 'app-log-panel',
  standalone: true,
  imports: [PanelChartComponent],
  templateUrl: './log-panel.component.html',
  styleUrl: './log-panel.component.scss',
})
export class LogPanelComponent {
  @Input() plant!: PlantExtendedInterface;
  @Input() room!: RoomExtendedInterface;
}
