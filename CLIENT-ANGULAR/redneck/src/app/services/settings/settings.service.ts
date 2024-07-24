import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  appName = '';
  serverAddress = '';
  purposes: string[] = [];
  purpose: number | null = null;
  datatables: string[] = [];
  resetDb = false;
  forceLoading = true;

  constructor() {
    this.init();
  }

  init() {
    this.appName = 'Grover/RedNeck';
    this.serverAddress = 'http://www.voidbrain.net/temp/grover/ajax/moduli/api';
    this.purposes = ['client', 'worker'];
    this.purpose = 0;
    this.datatables = [
      'calendars',
      'doses',
      'settings',
      'mediums',
      'scenarios',
      'plants',
      'companies',
      'strains',
      'containers',
      'containers_type',
      'probes_list',
      'probes_type',
      'workers_list',
      'workers_type',
      'probes_log',
      'workers_log',
    ];
  }
}
