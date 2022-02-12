import { exec } from 'child_process';

import { OperatingMode, Purposes } from './enums';

export class SettingsService {
  
	constructor() { }

  private locales = ['en', 'it'];
	private appName = 'Grover/RedNeck';
  
  private remoteServerHostname = 'www.voidbrain.net';
  private remoteServerEndpoint = 'temp/grover/ajax/moduli/api/worker/';
  private purposes: string[] = ['client', 'worker'];
  private purpose = Purposes.worker;
  private operatingMode = OperatingMode.On;
  private datatables = [
    'locations', 
    'rooms'
  ];
  private mainClock  = 5 * 1000; // ms

  public getLocales() {
    return this.locales;
  }

  public getClock() {
    return this.mainClock;
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
        resolve(stdout);
      });
    });
  }
}

export default SettingsService;
