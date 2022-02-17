import { exec } from 'child_process';
import moment from 'moment';
import { OperatingMode, Purposes } from './enums';

export class SettingsService {
  
	constructor() { }

  private locales = ['en', 'it'];
	private appName = 'Grover/RedNeck';
  
  private remoteServerHostname = 'www.voidbrain.net';
  private remoteServerEndpoint = 'temp/grover/ajax/moduli/api/worker/';
  private purposes: string[] = ['client', 'worker'];
  private purpose = Purposes.worker;
  private operatingMode = '';
  private operatingModes = [];
  private datatables = [
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
  private mainClockInterval  = 5 * 1000; // ms

  public getLocales() {
    return this.locales;
  }

  public getClockInterval() {
    return this.mainClockInterval;
  }

  public getAppName() {
    return this.appName;
  }

  public getPurposes() {
    return this.purposes;
  }

  public getTables() {
    return this.datatables;
  }

  public getPurpose() {
    return this.purpose;
  }

  public getOperatingMode() {
    return this.operatingMode;
  }

  public setOperatingMode(mode) {
    this.operatingMode = mode;
  }

  public setOperatingModes(operationgModes) {
    this.operatingModes = operationgModes;
  }

  public getRemoteServerHostname() {
    return this.remoteServerHostname;
  }

  public getRemoteServerEndpoint() {
    return this.remoteServerEndpoint;
  }

  public async getSerialNumber(): Promise<string> {
    return new Promise((resolve, reject) => {
      exec('cat /proc/cpuinfo | grep Serial',(error,stdout,stderr) => {
        if(error){
          console.error( `exec error: ${error}` );
          reject;
        }
        // console.log( `stdout: ${stdout}` );// this is your RPI serial number
        // console.log( `stderr: ${stderr}` );
        let sn = stdout.split(': ')[1]
        sn = sn.replace(/[\n\r\t\s]+/g, '');
        resolve(sn);
      });
    });
  }
}

export default SettingsService;
