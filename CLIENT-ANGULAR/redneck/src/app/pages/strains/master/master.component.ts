import { Component, ViewChildren } from '@angular/core';
import { ChartComponent } from '../../../components/chart/chart.component';
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

@Component({
  selector: 'app-master',
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
  @ViewChildren('slidingItem') private slidingItem: any;
  items: any;
  table: string = 'plants';

  constructor(
    private db: DbService,
    private router: Router,
  ) {
    this.init();
    addIcons(ionIcons);
  }

  private init() {}

  private getItems() {
    const itemsP = this.db.getItems(this.table);
    const calendarsP = this.db.getItems('calendars');
    const dosesP = this.db.getItems('doses');
    const strainsP = this.db.getItems('strains');
    Promise.all([itemsP, calendarsP, dosesP, strainsP]).then(
      ([items, calendars, doses, strains]) => {
        items.sort((a: any, b: any) => {
          const compare =
            a.dayHarvest != 0 && b.dayHarvest != 0
              ? 'dayHarvest'
              : a.dayStartBloom != 0 && b.dayStartBloom != 0
                ? 'dayStartBloom'
                : a.dayStartGrow != 0 && b.dayStartGrow != 0
                  ? 'dayStartGrow'
                  : 'id';
          a[compare] > b[compare] ? 1 : b[compare] > a[compare] ? -1 : 0;
        });

        items.map((item: any) => {
          item.strain = strains.find((el: any) => el.id == item.idStrain);
          item.chartConfig = {
            id: 'chart',
            type: 'doughnut',
            legend: false,
            data: {
              labels: ['Sativa', 'Indica'],
              datasets: [
                {
                  data: [
                    item.strain.percentSativa,
                    100 - item.strain.percentSativa,
                  ],
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
                ticks: { beginAtZero: true },
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
          const timeDiff = Math.abs(
            Date.now() -
              new Date(
                item.dayStartGrow ? item.dayStartGrow : Date.now(),
              ).getTime(),
          );
          item.weeks_n = Math.floor(
            Math.abs(timeDiff) / (1000 * 7 * 24 * 60 * 60),
          );
          for (const phase of calendars) {
            if (item.weeks_n < phase.duration) {
              item.phase = phase;
              break;
            }
          }
          const dose = item.phase
            ? item.phase
            : calendars[calendars.length - 1];
          item.dose = doses.find((singleDose: any) => {
            singleDose.id == dose.id_dose;
          });
          // item.phase.days = timeDiff - (item.weeks_n / (1000 * 7 * 24 * 60 * 60));
          // let phase_days = item.phase.week_n;
          const item_days = Math.floor(Math.abs(timeDiff) / (7 * 24 * 60 * 60));
          // console.log(phase_days,item_days)
        });
        this.items = items;
        console.info('[PAGE]: Ready');
      },
    );
  }

  deleteItem(item: any) {
    this.slidingItem._results.map((el: any) => {
      el.closeOpened();
    });
    this.db.deleteItem(this.table, item).then((result) => {
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
