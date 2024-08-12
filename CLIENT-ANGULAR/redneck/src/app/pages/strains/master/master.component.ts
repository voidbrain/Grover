import { Component, ViewChildren } from '@angular/core';
import { ChartComponent } from '../../../components/shared/chart/chart.component';
import {
  IonButton,
  IonButtons,
  IonContent,
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
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';
import { Strain } from '../../../interfaces/strain';

@Component({
  selector: 'app-strains-master',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    ChartComponent,
    IonButton,
    IonButtons,
    IonContent,
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
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './master.component.html',
  styleUrl: './master.component.scss',
})
export class StrainsMasterComponent {
  @ViewChildren('slidingItems') private slidingItems: IonItemSliding[] = [];
  items: Strain[] = [];
  page = 'strains';
  debug = true;

  constructor(
    private db: DbService,
    private router: Router,
  ) {
    addIcons(ionIcons);
    this.init();
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
    items.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
    items.map((item) => {
      item.chartConfig = {
        id: 'chart',
        type: 'doughnut',
        options: {
          plugins: {
            legend: {
              display: false,
            },
          },
        },
        data: {
          labels: ['Sativa', 'Indica'],
          datasets: [
            {
              data: [item.percentSativa, 100 - item.percentSativa],
              backgroundColor: [
                'rgba(17, 176, 50, 1)',
                'rgba(125, 17, 176, 1)',
              ],
              borderWidth: 1,
            },
          ],
        },
        xAxes: [
          {
            id: 'xAxis1',
            gridLines: {
              display: false,
            },
            display: false,
          },
        ],
        yAxes: [
          {
            display: false,
            stacked: false,
            gridLines: {
              display: false,
            },
          },
        ],
        labelsFontSize: 9,
        showValue: false,
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          },
        },
      };
    });
    this.items = items;
    console.info('[PAGE]: Ready');
  }

  async deleteItem(item: StrainInterface) {
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
    const forceLoading = true;
    const load = await this.db.initService(forceLoading);

    this.getItems();
    refresher.target.complete();

    load.catch((err) => console.error(err));
  }
}
