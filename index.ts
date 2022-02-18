// sudo node --loader ts-node/esm --experimental-specifier-resolution=node ./index.ts

import http from 'http';
import url from 'url';
import { LocalStorage } from 'node-localstorage';
import moment from 'moment';

import { Owner } from './app/services/settings/enums';

import SettingsService from './app/services/settings/settings.service';
import DbService from './app/services/db/db.service';
import ApiService from './app/services/api/api.service';

import { RoomObject }  from './app/interfaces/room';
import RoomComponent from './app/hw-components/environment/room/room';
import PotComponent from './app/hw-components/environment/pot/pot';
import { PotInterface } from './app/interfaces/pot';
import { LocationInterface } from './app/interfaces/location';
import { RoomInterface } from './app/interfaces/room';
class Main {
  server: http.Server;
  webServerPort: number;
  serialNumber: string;
  
  clock: number;
  settings = new SettingsService();
  api = new ApiService();
  db = new DbService(this.settings, this.api);
  localStorage = new LocalStorage('./data/scratch');

  room: any;
  rooms: any[] = [];
  pots: any[] = [];

  constructor(){ this.appSetup(); }

  async appSetup(){
    const self = this;
    await self.db.load();
    self.clock = self.settings.getClockInterval();
    self.serialNumber = (await self.settings.getSerialNumber()).sn;
    self.server = http.createServer();
    self.webServerPort = 8085;
    self.webServerSetup();

    const endpoint = 'endpoint';
    const action = 'START';
    const lastUpdate = self.localStorage.getItem(self.settings.getAppName());

    const device: any = await self.api.get(endpoint, lastUpdate, action, self.serialNumber);
    self.settings.setOperatingMode(device.operatingMode);

    console.log('[main] => initdb done');
    self.main();
  }

  async main(){
    const self = this;
    self.room = new RoomComponent(self.db, self.api, self.settings) as unknown as RoomObject;
    self.pots = self.room.pots;
    self.rooms.push(self.room);
    await self.room.setup(self.serialNumber);

    console.log(`[main] => ready`);  
  }

  
  /**
   * Webserver
   */

  start(){
    const self = this;
    self.server.on('request', async (req, res) => {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      const q = url.parse(req.url, true);
      if (q.pathname === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/x-icon'} );
        res.end();
        return;
      }
      const action = q.query.action as string;
      const id = q.query.id as string;
      const terminalType = q.query.type as string;
      const now = moment();

      if(action && id && terminalType) {
        const owner = Owner.user;
        const operatingMode = self.settings.getOperatingMode();
        const terminalsArr: any[] = await self.db.getItems(terminalType+'s_list') as any[];
        const terminal = terminalsArr.find(el => el.id === +id);
        const parentLocation: LocationInterface = await self.db.getItem('locations',  terminal.locationId, 'id') as LocationInterface;
        const parent = await self.db.findParent(parentLocation.id) as any;
        const environments = (parent.potName ? self.pots : self.rooms) as any;
        const environmentType = (parent.potName ? 'pot' : 'room');
        const environment = environments.find(el => el[environmentType].id === parent.id)
        const el = environment[terminalType+'s'].find(el => el.id === terminal.id);
        const doJob = await el.component[action]({now, owner, operatingMode});
        res.write(JSON.stringify(doJob));
      }
      res.end();
    });
  }
  
  listen(){
    this.server.listen(this.webServerPort);
    return
  }
  
  webServerSetup(){
    this.start();
    this.listen();
  }
}

const app = new Main();
