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
import { Company } from '../../../interfaces/company';

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
  @ViewChildren('slidingItems') private slidingItems: IonItemSliding[];
  items: Company[];
  page = 'companies';

  constructor(
    public db: DbService,
    public loadingController: LoadingController,
    public router: Router,
  ) {
    this.init();
    addIcons(ionIcons);
  }

  async init() {
    console.info('[PAGE]: Start');

    await this.db.load();

    const forceLoading = true;
    await this.db.initService(forceLoading);
    this.getItems();
  }

  async getItems() {
    const items = await this.db.getItems(this.page);
    this.items = items;
    console.log(items);
    console.info('[PAGE]: Ready');
  }

  async deleteItem(item) {
    this.slidingItems.map((el) => {
      el.closeOpened();
    });
    await this.db.deleteItem(this.page, item);
    this.getItems();
  }

  showDetail(item) {
    this.slidingItems.map((el) => {
      el.closeOpened();
    });

    this.router.navigate([this.page + '/edit', JSON.stringify(item.id)]);
  }

  async doRefresh(refresher) {
    this.slidingItems.map((el) => {
      el.closeOpened();
    });

    this.getItems();
    refresher.target.complete();
  }
}
