import { Component, Input, OnChanges } from '@angular/core';
import { NgStyle, DecimalPipe } from '@angular/common';

import { PlantExtended } from '../../../interfaces/plant';
import { IonCard, IonCardContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  standalone: true,
  imports: [IonCardContent, IonCard, NgStyle, DecimalPipe],
})
export class ProgressBarComponent implements OnChanges {
  @Input() plant!: PlantExtended;
  tot = 0;
  style = {};

  plantdaysFromGrowPerc;
  plantdaysFromBloomPerc;
  plantdaysFromFlushPerc;

  constructor() {
    this.plantdaysFromBloomPerc = 0;
    this.plantdaysFromFlushPerc = 0;
    this.plantdaysFromGrowPerc = 0;
  }

  ngOnChanges() {
    if (this.plant && this.plant !== undefined) {
      this.draw();
    }
  }

  addAlpha(color: string, opacity: number) {
    const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
  }

  draw() {
    if (this.plant) {
      let totFromGrow = 0;
      let totFromBloom = 0;
      let totFromFlush = 0;
      this.plant.calendar?.phases.map((phase) => {
        this.tot += phase.duration;
      });
      this.plant.calendar?.phases.map((phase, index) => {
        phase.startingDay = phase.isFlushing
          ? totFromFlush
          : phase.isBlooming
            ? totFromBloom
            : totFromGrow;
        totFromBloom += phase.isBlooming ? +phase.duration : 0;
        totFromFlush += phase.isFlushing ? +phase.duration : 0;
        totFromGrow +=
          !phase.isFlushing && !phase.isBlooming ? +phase.duration : 0;
        phase.daysFromGrow = totFromGrow;
        phase.daysFromBloom = totFromBloom;
        phase.daysFromFlush = totFromFlush;
        phase.percentDuration = +((phase.duration * 100) / this.tot);
        phase.percentStart = (
          index === 0 ? 0 : this.plant.calendar?.phases[index - 1].percentEnd
        ) as number;
        phase.percentEnd = phase.percentStart + phase.percentDuration;
        if (phase.isBlooming && !phase.isFlushing) {
          this.plantdaysFromBloomPerc += phase.percentDuration;
        }
        if (!phase.isBlooming && !phase.isFlushing) {
          this.plantdaysFromGrowPerc += phase.percentDuration;
        }
        if (phase.isFlushing) {
          this.plantdaysFromFlushPerc +=
            (phase.percentDuration * this.tot) / 100;
        }
      });

      const total =
        this.plantdaysFromBloomPerc +
        this.plantdaysFromFlushPerc +
        this.plantdaysFromGrowPerc;
      const diff = total - 100;
      if (diff !== 0) {
        this.plantdaysFromGrowPerc -= diff;
      }

      this.plantdaysFromBloomPerc += '%';
      this.plantdaysFromFlushPerc += '%';
      this.plantdaysFromGrowPerc += '%';
    }
  }
}
