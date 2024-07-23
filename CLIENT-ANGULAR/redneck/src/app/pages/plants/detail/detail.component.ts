import { Component, ViewChildren } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { ChartComponent } from '../../../components/chart/chart.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonCard, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonMenu, IonMenuToggle, IonRefresher, IonRefresherContent, IonReorder, IonReorderGroup, IonRow, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular/standalone';


@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    RouterLink, RouterOutlet, FormsModule, ReactiveFormsModule, ChartComponent,
    IonButton, IonButtons, IonCard, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonMenu, IonMenuToggle, IonRefresher, IonRefresherContent, IonReorder, IonReorderGroup, IonRow, IonSelectOption, IonTitle, IonToolbar
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class PlantsDetailComponent {

  constructor(
    private db: DbService,
    private router: Router
  ){
    this.init();
  }

  init(){}

  goBack() {
    this.router.navigate([this.page]);
  }

}
