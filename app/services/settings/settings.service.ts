import { exec } from 'child_process';
import { Purposes } from './enums';

export class SettingsService {
  
	constructor() { }

  private locales:string[] = ['en', 'it'];
	private appName:string = 'Grover/RedNeck';
  
  private remoteServerHostname:string = 'www.voidbrain.net';
  private remoteServerEndpoint:string = 'temp/grover/ajax/moduli/api/worker/';
  private purposes: string[] = ['client', 'worker'];
  private purpose: number = Purposes.worker;
  private operatingMode:number = null;

  private datatables:string[] = [
    'locations', 
    'pots',
    'rooms',
    'operating_modes',
    'settings',
    'probes_list',
    'workers_list',
    'probes_type',
    'workers_type',
    'probes_schedule',
    'probes_log',
    'workers_schedule',
    'workers_log',
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

  public async getSerialNumber(): Promise<string> {
    return new Promise((resolve, reject) => {
      exec('cat /proc/cpuinfo | grep Serial', (error, stdout, stderr) => {
        if(stderr){
          console.log('[SETTINGS]: EXIT on --> Raspberry not found');
        } else {
          const sn = stdout.split(': ')[1].trim();
          resolve(sn);
        }
      });
    });
  }
}

export default SettingsService;
