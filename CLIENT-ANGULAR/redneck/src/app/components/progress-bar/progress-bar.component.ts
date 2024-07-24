import { Component } from '@angular/core';
import { IonCardContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [IonCardContent, ],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss'
})
export class ProgressBarComponent {

}
