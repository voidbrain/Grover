import { exec } from 'child_process';
import { Purposes } from './enums';

export class SettingsService {
  
	constructor() { }

  private locales:string[] = ['en', 'it'];
	private appName:string = 'Grover/RedNeck';
  
  private remoteServerHostname:string = 'https://www.voidbrain.net';
  private remoteServerEndpoint:string = 'temp/grover/ajax/moduli/api/worker/';
  private purposes: string[] = ['client', 'worker'];
  private purpose: number = Purposes.worker;
  private operatingMode:number = null;
  private logMode:boolean = true;

  private datatables:string[] = [
    'calendar_doses',
    'calendar_phases',
    'calendars',
    'locations', 
    'operating_modes',
    
    'rooms',
    'plants',
    'pots',
    'probes_list',
    // 'probes_log',

    'probes_schedule',
    'probes_type',
    'settings',
    // 'system_log',
    'system_schedule',
    
    'workers_list',
    // 'workers_log',
    'workers_schedule',
    'workers_type',
  ];
  private mainClockInterval:number = 5 * 1000; // ms

  public getLocales() :string[] {
    return this.locales;
  }

  public getClockInterval() : number {
    return this.mainClockInterval;
  }

  public getAppName() :string {
    return this.appName;
  }

  public getPurposes() :string[] {
    return this.purposes;
  }

  public getTables() :string[] {
    return this.datatables;
  }

  public getPurpose() :number {
    return this.purpose;
  }

  public getLogMode(): boolean {
    return this.logMode;
  }


  public setLogMode(mode: boolean) : void {
    this.logMode = mode;
  }

  public getOperatingMode() :number {
    return this.operatingMode;
  }

  public setOperatingMode(mode: number) : void {
    this.operatingMode = mode;
  }

  public getRemoteServerHostname() :string {
    return this.remoteServerHostname;
  }

  public getRemoteServerEndpoint() :string {
    return this.remoteServerEndpoint;
  }

  public async getSerialNumber(): Promise<{ found:boolean, sn:string }> {
    return new Promise((resolve, reject) => {
      exec('cat /proc/cpuinfo | grep Serial', (error, stdout, stderr) => {
        if(stderr){
          resolve({found: false, sn:'10000000ce6b74fc'});
        } else {
          const sn = stdout.split(': ')[1].trim();
          resolve({found: true, sn: sn});
        }
      });
    });
  }
}

export default SettingsService;
