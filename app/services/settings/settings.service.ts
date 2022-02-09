export class SettingsService {
  
	constructor() { }

  private locales = ['en', 'it'];
	private appName = 'Grover/RedNeck';
  
  private remoteServerHostname = 'www.voidbrain.net';
  private remoteServerEndpoint = 'temp/grover/ajax/moduli/api/worker/';
  private purposes: string[] = ['client', 'worker'];
  private purpose = 1;
  private datatables = [
    'plants', 
    // 'doses', 
    // 'locations', 
    // 'generalsettings', 
    // 'growingmediums', 
    // 'growingscenarios', 
    // 'plants', 
    // 'companies', 
    // 'strains'

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

  public getRemoteServerHostname() {
    return this.remoteServerHostname;
  }

  public getRemoteServerEndpoint() {
    return this.remoteServerEndpoint;
  }
}

export default SettingsService;
