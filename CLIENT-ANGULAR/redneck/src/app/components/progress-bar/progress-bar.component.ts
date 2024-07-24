import { Component } from '@angular/core';
import { IonCardContent, IonCard } from "@ionic/angular/standalone";

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [IonCard, IonCardContent, ],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss'
})
export class ProgressBarComponent {

  constructor() {
    this.tot = 0;
    this.style = {};
    this.plantdaysFromBloomPerc = 0;
    this.plantdaysFromFlushPerc = 0;
    this.plantdaysFromGrowPerc = 0;
}

}
