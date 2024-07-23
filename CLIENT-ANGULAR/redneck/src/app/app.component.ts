import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'redneck';

  appPages = [
    { title: 'home', url: '/home', icon: 'home' },
    { title: 'plants', url: '/plants', icon: 'flower' },
    { title: 'strains', url: '/strains', icon: 'leaf' },
    { title: 'companies', url: '/companies', icon: 'business' },
    { title: 'calendars', url: '/calendars', icon: 'calendar' },
    { title: 'doses', url: '/doses', icon: 'flask' },
    { title: 'settings', url: '/settings', icon: 'settings' }
  ];
}
