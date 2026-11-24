import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./dashboard').then((m) => m.Dashboard), title: 'Grover' },
  {
    path: 'probes/:id',
    loadComponent: () => import('./probe-page').then((m) => m.ProbePage),
    title: 'Probe history · Grover',
  },
  { path: '**', redirectTo: '' },
];
