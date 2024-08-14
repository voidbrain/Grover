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
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';
import { StrainInterface } from '../../../interfaces/strain';

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
  items: StrainInterface[] = [];
  page = 'strains';
  debug = true;

  constructor(private db: DbService, private router: Router) {
    addIcons(ionIcons);
  }

  // Using Ionic lifecycle hook to initialize data when the view is about to be presented
  async ionViewWillEnter() {
    console.info('[PAGE]: Start');
    try {
      await this.db.load();
      const forceLoading = true;
      await this.db.initService(forceLoading);
      await this.getItems();
    } catch (err) {
      console.error('Error during initialization:', err);
    }
  }

  async getItems() {
    try {
      const items: StrainInterface[] = (await this.db.getItems(this.page)) as StrainInterface[];
      items.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
      items.forEach((item) => {
        item.chartConfig = {
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
        };
      });
      this.items = items;
      console.info('[PAGE]: Ready');
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  }

  async deleteItem(item: StrainInterface) {
    try {
      this.slidingItems.forEach((el) => {
        el.closeOpened();
      });
      await this.db.deleteItem(this.page, item);
      await this.getItems(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  showDetail(item: StrainInterface) {
    this.slidingItems.forEach((el) => {
      el.closeOpened();
    });
    this.router.navigate([`${this.page}/edit`, JSON.stringify(item.id)]);
  }

  async doRefresh(refresher: RefresherCustomEvent) {
    try {
      this.slidingItems.forEach((el) => {
        el.closeOpened();
      });
      const forceLoading = true;
      await this.db.initService(forceLoading);
      await this.getItems();
      refresher.target.complete();
    } catch (error) {
      refresher.target.complete();
      console.error('Error refreshing items:', error);
    }
  }

  // Optional: Add trackBy to ngFor for better performance in large lists
  trackById(index: number, item: StrainInterface) {
    return item.id; // Or another unique identifier for StrainInterface
  }
}
