export class SettingsService {

	constructor() { }

  private locales = ['en', 'it'];
	public appName = 'Grover/RedNeck';
  public serverAddress = 'https://www.voidbrain.net/temp/grover/ajax/moduli/api';
  public purposes: string[] = ['client', 'worker'];
  public purpose = 0;
  public datatables = [
    'calendars', 'doses', 'locations', 'generalsettings', 'growingmediums', 'growingscenarios', 'plants', 'companies', 'strains'
  ];

  getLocales() {
    return this.locales;
  }
}
