import { CommonModule } from '@angular/common';
import {
  APP_INITIALIZER,
  Component,
} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import {
  IonApp,
  IonSplitPane,
  IonMenu,
  IonMenuToggle,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';
import { DbService } from './services/db/db.service';

export function initializeApp(dbService: DbService): () => Promise<void> {
  console.log("ooooo")
  return () => dbService.hi();
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    IonApp,
    IonSplitPane,
    IonMenu,
    IonMenuToggle,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [
    DbService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [DbService],
      multi: true,
    },
  ],
})
export class AppComponent {
  title = 'redneck';

  constructor() {
    addIcons(ionIcons);
  }

  appPages = [
    { title: 'home', url: '/home', icon: 'home' },
    { title: 'plants', url: '/plants', icon: 'flower' },
    { title: 'strains', url: '/strains', icon: 'leaf' },
    { title: 'companies', url: '/companies', icon: 'business' },
    { title: 'calendars', url: '/calendars', icon: 'calendar' },
    { title: 'doses', url: '/doses', icon: 'flask' },
    { title: 'settings', url: '/settings', icon: 'settings' },
  ];
}
