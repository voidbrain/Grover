import { Component } from '@angular/core';
import { IonItem, IonLabel, IonBadge, IonRange, IonIcon } from "@ionic/angular/standalone";

@Component({
  selector: 'app-range',
  standalone: true,
  imports: [IonIcon, IonRange, IonBadge, IonLabel, IonItem, ],
  templateUrl: './range.component.html',
  styleUrl: './range.component.scss'
})
export class RangeComponent {

}
