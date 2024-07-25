import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PlantExtended } from '../../../../interfaces/plant';
import { RoomExtended } from '../../../../interfaces/room';

@Component({
  selector: 'app-detail-table',
  templateUrl: './table.component.html',
  standalone: true,
  imports: [],
  styleUrls: ['./table.component.scss'],
})
export class PanelTableComponent implements OnChanges {
  @Input() plant: PlantExtended;
  @Input() room: RoomExtended;
  @Input() tableValues: any[] = [];

  ngOnChanges(changes: SimpleChanges) {
    // if(this.plant && this.plant !== undefined) {
    //   this.setup();
    // }
    if (this.tableValues && this.tableValues !== undefined) {
      this.setup();
    }
  }

  setup() {
    // this.plant.probes.map(probe => {
    //   console.log(probe);
    //   if(probe.log) { this.logsArr.push(probe.log); }
    // });
    // this.plant.workers.map(worker => {
    //   console.log(worker);
    //   if(worker.log) { this.logsArr.push(worker.log); }
    // });
    // console.log(this.logsArr);
  }
}
