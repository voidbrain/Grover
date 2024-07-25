import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private locales = ['en', 'it'];
	public appName = 'Grover/RedNeck';
  public serverAddress = 'https://www.voidbrain.net/temp/grover/ajax/moduli/api';
  public purposes: string[] = ['client', 'worker'];
  public purpose = 0;
  public datatables = [
    'calendars', 'doses', 'pots', 'growing_mediums', 'growing_scenarios', 'plants', 'companies', 'strains',
    'settings', 'locations', 'rooms', 'operating_modes',
    'probes_list', 'probes_log', 'probes_schedule', 'probes_type',
    'workers_list', 'workers_log', 'workers_schedule', 'workers_type'
  ];
}