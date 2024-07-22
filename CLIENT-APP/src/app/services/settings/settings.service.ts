import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    constructor() { }

    public appName = 'Grover/RedNeck';
    public serverAddress = 'http://www.voidbrain.net/temp/grover/ajax/moduli/api';
    public purposes: string[] = ['client', 'worker'];
    public purpose = 0;
    public datatables = [
        'calendars', 'doses', 'settings', 'mediums', 'scenarios', 'plants', 'companies', 'strains', 'containers',
        'containers_type', 'probes_list', 'probes_type', 'workers_list', 'workers_type', 'probes_log', 'workers_log'
    ];

    public resetDb = false;
    public forceLoading = false;
}
