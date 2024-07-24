import { Component, Input } from '@angular/core';
import { PlantExtended } from '../../../interfaces/plant';
import { RoomExtended } from '../../../interfaces/room';

@Component({
  selector: 'app-detail-panel',
  standalone: true,
  imports: [],
  templateUrl: './detail-panel.component.html',
  styleUrl: './detail-panel.component.scss'
})
export class DetailPanelComponent {

  @Input() plant: PlantExtended;
  @Input() room: RoomExtended;

  hideSchedule = false;
  hideLog = true;

  setViewComponent(event){
    switch(event.detail.value) {
      case 'schedule':
      this.hideLog = true;
      this.hideSchedule = false;
      break;
      case 'log':
      this.hideLog = false;
      this.hideSchedule = true;
      break;
    }
  }

}
