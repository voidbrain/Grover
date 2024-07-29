import { Component, ViewChildren } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { ChartComponent } from '../../../components/shared/chart/chart.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonRefresher,
  IonRefresherContent,
  IonReorder,
  IonReorderGroup,
  IonRow,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';

@Component({
  selector: 'app-companies-master',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    ChartComponent,
    IonButton,
    IonButtons,
    IonCard,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuButton,
    IonMenuToggle,
    IonRefresher,
    IonRefresherContent,
    IonReorder,
    IonReorderGroup,
    IonRow,
    IonSelectOption,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './master.component.html',
  styleUrl: './master.component.scss',
})
export class CompaniesMasterComponent {
  @ViewChildren('slidingItem') private slidingItem: any;
  items: any;
  table = 'companies';
  page = 'plants';

  constructor(
    public db: DbService,
    public loadingController: LoadingController,
    public router: Router,
  ) {
    this.init();
    addIcons(ionIcons);
  }

  init() {
    console.info('[PAGE]: Start');

    this.db
      .load()
      .then(() => {
        const forceLoading = true;
        this.db.initService(forceLoading).then(() => {
          this.getItems();
        });
      })
      .catch((err) => console.error(err));
  }

  getItems() {
    this.db.getItems(this.table).then((items) => {
      this.items = items;
      console.log(items)
      console.info('[PAGE]: Ready');
    });
  }

  deleteItem(item: any) {
    this.slidingItem._results.map((el: any) => {
      el.closeOpened();
    });
    this.db.deleteItem(this.table, item).then(() => {
      this.getItems();
    });
  }

  showDetail(item: any) {
    this.slidingItem._results.map((el: any) => {
      el.closeOpened();
    });

    this.router.navigate([this.table + '/edit', JSON.stringify(item.id)]);
  }

  doRefresh(refresher: any) {
    this.slidingItem._results.map((el: any) => {
      el.closeOpened();
    });
    const forceLoading = true;
    this.db
      .initService(forceLoading)
      .then(() => {
        this.getItems();
        refresher.target.complete();
      })
      .catch((err) => console.error(err));
  }
}
