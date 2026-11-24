import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./dashboard').then((m) => m.Dashboard), title: 'Grover' },
  {
    path: 'probes/:id',
    loadComponent: () => import('./probe-page').then((m) => m.ProbePage),
    title: 'Probe history · Grover',
  },
  {
    path: 'setup',
    loadComponent: () => import('./setup/setup-page').then((m) => m.SetupPage),
    title: 'Setup · Grover',
  },
  {
    path: 'setup/rooms/:id',
    loadComponent: () => import('./setup/room-setup').then((m) => m.RoomSetup),
    title: 'Room setup · Grover',
  },
  {
    path: 'setup/calendars/:id',
    loadComponent: () => import('./setup/calendar-setup').then((m) => m.CalendarSetup),
    title: 'Grow calendar · Grover',
  },
  {
    path: 'setup/plants',
    loadComponent: () => import('./setup/plants-setup').then((m) => m.PlantsSetup),
    title: 'Plants and strains · Grover',
  },
  { path: '**', redirectTo: '' },
];
