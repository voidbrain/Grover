import { Component, ViewChildren } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { ChartComponent } from '../../../components/shared/chart/chart.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
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
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';
import { DosesBarHorizontalComponent } from '../../../components/plants/detail-panel/doses-bar-horizontal/doses-bar-horizontal.component';

@Component({
  selector: 'app-doses-master',
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
    DosesBarHorizontalComponent
],
  templateUrl: './master.component.html',
  styleUrl: './master.component.scss',
})
export class DosesMasterComponent {
  math = Math;
  @ViewChildren('slidingItem') private slidingItem: any;
  items: any;
  page = 'doses';

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
    items.map((item: any) => {

      item.chartConfig = {
        id: 'chart',
        type: 'bar',
        legend: false,
        data: {
          labels: ['Gro', 'Micro', 'Bloom', 'Ripen', 'EC'],
          datasets: [
            {
              data: [item.grow, item.micro, item.bloom, item.ripen, item.EC],
              backgroundColor: [
                'rgba(17, 176, 50, 1)',
                'rgba(125, 17, 176, 1)',
                'rgba(176, 17, 17, 1)',
                'rgba(240, 215, 7, 1)',
                'rgba(7, 18, 240, 1)',
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
            ticks: { beginAtZero: true },
            gridLines: {
              display: false,
            },
          },
        ],
        labelsFontSize: 9,
        showValue: true,
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 20,
            bottom: 0,
          },
        },
      };
    });
    this.items = items;
    console.info('[PAGE]: Ready');
  }

  async deleteItem(item: any) {
    this.slidingItem._results.map((el: any) => {
      el.closeOpened();
    });
    await this.db.deleteItem(this.page, item);
    this.getItems();
  }

  showDetail(item: any) {
    this.slidingItem._results.map((el: any) => {
      el.closeOpened();
    });
    this.router.navigate([this.page + '/edit', JSON.stringify(item.id)]);
  }

  async doRefresh(refresher: any) {
    this.slidingItem._results.map((el: any) => {
      el.closeOpened();
    });

    this.getItems();
    refresher.target.complete();
  }
}
