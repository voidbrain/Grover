// sudo node --loader ts-node/esm --experimental-specifier-resolution=node ./index.ts

import http from 'http';
import url from 'url';
import { LocalStorage } from 'node-localstorage';

import { Owner } from './app/services/settings/enums';

import SettingsService from './app/services/settings/settings.service';
import DbService from './app/services/db/db.service';
import ApiService from './app/services/api/api.service';

import { RoomObject }  from './app/interfaces/room';
import RoomComponent from './app/hw-components/environment/room/room';
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
    self.serialNumber = await self.settings.getSerialNumber();
    self.server = http.createServer();
    self.webServerPort = 8084;
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
    self.room = new RoomComponent(self.db, self.settings) as unknown as RoomObject;
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
      const type = q.query.type as string;
      const probe = q.query.probe as string;
      const now = new Date();

      console.log(action, id, probe, type);

      if(action && id && probe && type) {
        const el = self[type].find(el => el.id === +id);
        const item = el.probes[probe];
        const owner = Owner.user;
        const doJob = await item[action]({now, owner});
        console.log(JSON.stringify(doJob));
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
