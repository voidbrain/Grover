/* eslint-disable @typescript-eslint/naming-convention */

import { Component } from '@angular/core';
import 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';
declare const Chart;
Chart.pluginService.register(annotationPlugin);
Chart.pluginService.register(zoomPlugin);

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'home',       url: 'pages/home',         icon: 'home' },
    { title: 'plants',     url: 'pages/plants',       icon: 'flower' },
    { title: 'strains',    url: 'pages/strains',      icon: 'leaf' },
    { title: 'calendar',   url: 'pages/calendar',     icon: 'calendar' },
    { title: 'companies',  url: 'pages/companies',    icon: 'business' },
    { title: 'doses',      url: 'pages/doses',        icon: 'flask' },
    { title: 'settings',   url: 'pages/settings',     icon: 'settings' }
];
  constructor() {}
}
