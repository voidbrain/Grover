import { Component, Input } from '@angular/core';
import { PlantExtended } from '../../../interfaces/plant';
import { RoomExtended } from '../../../interfaces/room';
import { IonGrid, IonRow, IonCol, IonCardContent, IonCard, IonLabel, IonSegment, IonSegmentButton } from "@ionic/angular/standalone";
import { SchedulePanelComponent } from './schedule-panel/schedule-panel.component';
import { LogPanelComponent } from './log-panel/log-panel.component';
import { PhaseDetailComponent } from './phase-details/phase-details.component';

@Component({
  selector: 'app-detail-panel',
  standalone: true,
  imports: [IonSegmentButton, IonSegment, IonLabel, IonCard, IonCardContent, IonCol, IonRow, IonGrid, SchedulePanelComponent,
    LogPanelComponent,
    PhaseDetailComponent],
  templateUrl: './detail-panel.component.html',
  styleUrl: './detail-panel.component.scss'
})
export class DetailPanelComponent {

  @Input() plant!: PlantExtended;
  @Input() room!: RoomExtended;

  hideSchedule = false;
  hideLog = true;

  setViewComponent(event: any){
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
