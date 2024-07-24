/* eslint-disable no-underscore-dangle */
import { Component, Input, OnChanges } from '@angular/core';

import { PlantExtended } from '../../../interfaces/plant';

@Component({
  selector: 'app-growing-results',
  templateUrl: './growing-results.component.html',
  styleUrls: ['./growing-results.component.scss'],
})
export class GrowingResultsComponent implements OnChanges {
  @Input() plant: PlantExtended;

  constructor() {
  }

  ngOnChanges() {
    if(this.plant && this.plant !== undefined) {
      this.draw();
    }
  }

  draw() {

  }
}
