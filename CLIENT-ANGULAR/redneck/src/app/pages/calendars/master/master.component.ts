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
  IonMenuToggle,
  IonRefresher,
  IonRefresherContent,
  IonReorder,
  IonReorderGroup,
  IonRow,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';
import { CalendarExtendedInterface, PhaseExtendedInterface } from '../../../interfaces/calendar';
import { DoseExtendedInterface } from '../../../interfaces/dose';

@Component({
  selector: 'app-calendar-master',
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
export class CalendarsMasterComponent {
  @ViewChildren('slidingItems') private slidingItems: IonItemSliding[] = [];
  items: CalendarExtendedInterface[] = [];
  page = 'calendars';

  constructor(
    private db: DbService,
    private router: Router,
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
    const items = await this.db.getItems(this.page) as CalendarExtendedInterface[];
    const doses = await this.db.getItems('doses');

    items.map((item: CalendarExtendedInterface) => {
      if (typeof item.phases == 'string') {
        if (item.phases != '') {
          item.phases = JSON.parse(item.phases);
        } else {
          item.phases = [];
        }
      }
      item.doses = item.phases;
      const valuesArr: PhaseExtendedInterface[] = [];
      if (item.doses && item.doses != null) {
        item.doses.forEach((dose: PhaseExtendedInterface) => {
          const phase = (doses as DoseExtendedInterface[]).find((el: DoseExtendedInterface) => el.id == dose.id);
          valuesArr.push({
            data: [Math.floor(dose.duration / 7)], // weeks
            backgroundColor: [phase!.color],
          });
          console.log(valuesArr);
        });
        item.chartConfig = {
          id: 'chart',
          type: 'bar',
          legend: false,
          data: {
            labels: ['Time'],
            datasets: valuesArr,
          },
          // x: {
          //     stacked: true,
          //     show: false,
          //     gridLines : {
          //         display : false
          //     }
          // },
          xAxes: [
            {
              id: 'xAxis1',
              stacked: true,
              gridLines: {
                display: false,
              },
              display: false,
            },
          ],
          // y: {
          //     stacked: true,
          //     show: false,
          // },
          yAxes: [
            {
              display: false,
              stacked: true,
              ticks: { beginAtZero: true },
              gridLines: {
                display: false,
              },
            },
          ],
          labelsFontSize: 9,
          showValue: true,
          showLineTitle: false,
          // layout: {
          //     padding: {
          //         left: 0,
          //         right: 0,
          //         top: 20,
          //         bottom: 0
          //     }
          // }
        };
      }
    });
    this.items = items as CalendarExtendedInterface[];
    console.info('[PAGE]: Ready');
  }

  async deleteItem(item: CalendarExtendedInterface) {
    this.slidingItems.map((el) => {
      el.closeOpened();
    });
    await this.db.deleteItem(this.page, item);
    this.getItems();
  }

  showDetail(item: CalendarExtendedInterface) {
    this.slidingItems.map((el) => {
      el.closeOpened();
    });
    this.router.navigate([this.page + '/edit', JSON.stringify(item.id)]);
  }

  async doRefresh(refresher: RefresherCustomEvent) {
    this.slidingItems.map((el) => {
      el.closeOpened();
    });
    this.getItems();
    refresher.target.complete();
  }
}
