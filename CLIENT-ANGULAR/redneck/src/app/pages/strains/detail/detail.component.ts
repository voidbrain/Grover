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
export class StrainsDetailComponent {

  constructor(
    private db: DbService,
    private router: Router
  ){
    this.init();
  }


  goBack() {
    this.router.navigate([this.page]);
  }

  init() {
    this.db.load().then(() => {
        const id = this.route.snapshot.paramMap.get('id');
        this.getItem(parseInt(id));
    }).catch(err => console.error(err));
}


getItem(id) {
    if (id){
        this.db.getItem(this.page, id).then(item => {
            this.form.patchValue(item, {emitEvent: true});
        })
    }
}

addConnectivityListeners(): void {
    this.network.watchOnline().subscribe(() => {
        console.log('online')
        this.isOnline = true;
        this.isReadyToSave = this.form.valid;
    });

    this.network.watchOffline().subscribe(() => {
        console.log('offline')
        this.isOnline = false;
        this.isReadyToSave = false;
    });
}

saveForm(){
    const saveItem = Array();
    saveItem.push(this.form.value)
    this.db.putItems(this.page, saveItem).then((result) => {
        this.router.navigate([this.page]);
    })
}

}
