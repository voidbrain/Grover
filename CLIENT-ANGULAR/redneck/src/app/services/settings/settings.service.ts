import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  appName = '';
  serverAddress = '';
  purposes: string[] = [];
  purpose: number | null = null;
  probesTypes: string[] = [];
  operatingModes: string[] = [];
  owner: string[] = [];
  scheduleTypes: string[] = [];
  serverCommands: string[] = [];
  workersTypes: string[] = [];


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
    this.probesTypes = [
     "Air_temperature",
    "Water_temperature",
    "Water_level",
    "pH",
    "EC",
    ];
    this.operatingModes = [
      "Normal",
      "Silent",
      "Off",
    ];
    this.owner = ["schedule", "user", "start"];
    this.scheduleTypes = ["From_To", "At"];

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

    this.serverCommands = [
"RUN_WATER",
    "RUN_PHDOWN",
    "RUN_DOSE",
    "SHUFFLE_PHDOWN",
    "SHUFFLE_DOSE",
    "READ",
    "ON",
    "OFF",
    "SET_STATUS",
    "LOG",
    "START",
    "SYS_LOG",
    "SET_MODE",
    ];

    this.workersTypes = [
    "Pot_Water_loop",
    "Pot_refill",
    // Pot_Nutrient_refill = 3,
    // Pot_PHdown_refill = 4,
    "Room_Water_refill",
    "Room_PhDown_refill",
    "Room_Gro_refill",
    "Room_Micro_refill",
    "Room_Bloom_refill",
    "Room_Ripen_refill",
    "Room_Fan",
    "Room_Light",
    "Room_Nutrient_refill"
    ];
  }
}
