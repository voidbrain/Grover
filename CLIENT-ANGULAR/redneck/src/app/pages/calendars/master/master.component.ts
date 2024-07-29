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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';

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
  @ViewChildren('slidingItem') private slidingItem: any;
  items: any;
  table = 'calendars';

  constructor(
    private db: DbService,
    private router: Router,
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
    const itemsP = this.db.getItems(this.table);
    const dosesP = this.db.getItems('doses');
    Promise.all([itemsP, dosesP]).then(([items, doses]) => {
      (items as any).map((item: any) => {
        if (typeof item.phases == 'string') {
          if (item.phases != '') {
            item.phases = JSON.parse(item.phases);
          } else {
            item.phases = [];
          }
        }
        item.doses = item.phases;
        const valuesArr: any[] = [];
        if (item.doses && item.doses != null) {
          item.doses.forEach((dose: any) => {
            const phase = (doses as any).find((el: any) => el.id == dose.id);
            valuesArr.push({
              data: [Math.floor(dose.duration / 7)], // weeks
              backgroundColor: [phase.color],
            });
            console.log(valuesArr)
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
      this.items = items;
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
