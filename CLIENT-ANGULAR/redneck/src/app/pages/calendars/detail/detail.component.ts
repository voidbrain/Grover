import { Component, ViewChildren } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { ChartComponent } from '../../../components/chart/chart.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-detail',
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
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class CalendarsDetailComponent {
  @ViewChildren('slidingItem') private slidingItem: any;
  page = 'calendars';
  table = 'calendars';
  showForm = true;
  showSubForm = false;
  isOnline = false;
  isReadyToSave = false;
  form: FormGroup = new FormGroup({});
  item: any = null;

  newPhase = {
    phase: null,
    duration: null,
  };
  relatedPhases: any;
  phases: any;

  constructor(private db: DbService, private router: Router) {}

  goBack() {
    this.router.navigate([this.page]);
  }

  doRefresh(refresher: any) {
    this.slidingItem._results.map((el: any) => {
      el.closeOpened();
    });
    const forceLoading = true;
    this.db
      .initService(forceLoading)
      .then(() => {
        refresher.target.complete();
      })
      .catch((err: any) => console.error(err));
  }

  getNextPos() {
    return this.relatedPhases.length
      ? Math.max.apply(
          Math,
          this.relatedPhases.map(function (o: any) {
            return o.pos + 1;
          })
        )
      : 1;
  }

  deleteItem(item: any) {
    const filtered = this.relatedPhases.filter((el: any) => {
      return el.id !== item.id;
    });
    this.updateList(filtered);
  }

  updateList(items: any): Promise<void> {
    return new Promise((resolve) => {
      this.item.phases = [];
      items.forEach((phase: any, index: any) => {
        this.item.phases[index] = (({ id, pos, duration }) => ({
          id,
          pos,
          duration,
        }))(phase);
      });

      this.db.putItems(this.table, [this.item]).then(() => {
        this.buildGraph();
        resolve();
      });
    });
  }

  saveForm() {
    const saveItem = Array();
    saveItem.push(this.form.value);
    saveItem[<any>'phases'] = this.relatedPhases;
    saveItem[<any>'phases'].forEach((phase: any, index: any) => {
      saveItem[<any>'phases'][index] = (({ id, pos, duration }) => ({
        id,
        pos,
        duration,
      }))(phase);
    });
    this.db.putItems(this.page, saveItem).then((result) => {
      this.router.navigate([this.page]);
    });
  }

  addPhase() {
    const pos = this.getNextPos();
    console.log(pos);
    const newPhase = {
      id: this.newPhase.phase,
      pos: pos,
      duration: this.newPhase.duration,
    };

    this.newPhase.phase = this.newPhase.duration = null;
    this.showSubForm = false;

    if (this.relatedPhases === null) {
      this.relatedPhases = [];
    }

    this.relatedPhases.push(newPhase);
    this.item.phases = this.relatedPhases;
    this.item.phases.forEach((phase: any, index: number) => {
      this.item.phases[index] = (({ id, pos, duration }) => ({
        id,
        pos,
        duration,
      }))(phase);
    });
    this.db.putItems(this.page, [this.item]).then((result) => {
      this.buildGraph();
    });
  }

  buildGraph() {
    const item = this.item;
    const doses = this.phases;
    if (item.phases) {
      item.phases.forEach((phase: any) => {
        phase.chartConfig = {};
        const dose = doses.find((el: any) => el.id == phase.id);
        if (dose) {
          phase.name = dose.name;
          phase.chartConfig = {
            id: 'chart',
            type: 'bar',
            legend: false,
            data: {
              labels: ['Gro', 'Micro', 'Bloom', 'Ripen', 'EC'],
              datasets: [
                {
                  data: [dose.gro, dose.micro, dose.bloom, dose.ripen, dose.EC],
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
            // x: {
            //     stacked: false,
            //     show: false,
            //     gridLines : {
            //         display : false
            //     }
            // },
            xAxes: [
              {
                id: 'xAxis2',
                gridLines: {
                  display: false,
                },
                display: false,
              },
            ],
            // y: {
            //     stacked: false,
            //     show: false,
            // },
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
                left: 100,
                right: 0,
                top: 20,
                bottom: 0,
              },
            },
          };
        }
      });
    } else {
      item.phases = [];
    }
    this.relatedPhases = item.phases;
  }

  reorder(event: any) {
    const originalPhases = this.relatedPhases;
    const draggedItem = this.relatedPhases.splice(event.detail.from, 1)[0];
    this.relatedPhases.splice(event.detail.to, 0, draggedItem);
    const update = [
      this.relatedPhases[event.detail.to],
      this.relatedPhases[event.detail.from],
    ];

    const und = update.some(function (el) {
      return typeof el == 'undefined';
    });
    if (und) {
      this.relatedPhases = originalPhases;
    } else {
      update.forEach((el, index) => {
        if (el) {
          el.pos = index;
          el.lastUpdate = Date.now();
        } else {
          update.splice(index, 1);
        }
        this.relatedPhases[index].pos = el.pos;
      });
      this.updateList(this.relatedPhases).then(() => {});
    }
    event.detail.complete();
  }
}
