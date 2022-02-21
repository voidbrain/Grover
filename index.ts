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
import { PotInterface, PotObject } from './app/interfaces/pot';
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

  room: RoomObject;
  rooms: RoomObject[] = [];
  pots: PotObject[] = [];

  constructor(){ this.appSetup(); }

  async appSetup(){
    const self = this;
    await self.db.load();
    self.clock = self.settings.getClockInterval();
    self.serialNumber = (await self.settings.getSerialNumber()).sn;
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
    self.room = new RoomComponent(self.db, self.api, self.settings) as unknown as RoomObject;
    self.pots = self.room.pots;
    self.rooms.push(self.room);
    await self.room.setup(self.serialNumber);

    console.log(`[main] => ready`);  
  }

  async updateOperatingMode(mode: number) {
    const self = this;
    self.settings.setOperatingMode(mode);
    self.rooms.map(room => {
      room.probes.map(probe => {})
      room.workers.map(worker => {})
      room.pots.map(pot => {
        pot.probes.map(probe => {})
        pot.workers.map(worker => {})
      })
    })
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
      const page = q.pathname;
      const owner = Owner.user;
      const operatingMode = self.settings.getOperatingMode();
      const now = moment();
      switch(page){
        case '/log':
          const id = q.query.id as string;
          const terminalType = q.query.type as string;
         
          if(action && id && terminalType) {
            const terminal: any = await self.db.getItem(terminalType+'s_list', +id, 'id') as any;
            const parentLocation: LocationInterface = await self.db.getItem('locations',  +terminal.locationId, 'id') as LocationInterface;
            const parent = await self.db.findParent(parentLocation.id) as any;
            const environments = (+parent.parent > 0 ? self.pots : self.rooms) as any;
            const environmentType = (+parent.parent > 0 ? 'pot' : 'room');
            const environment = environments.find(el => +el[environmentType].locationId === +parent[`${environmentType}LocationId`]);
            if(environment) {
              const el = environment[terminalType+'s'].find(el => +el[`locationId`] === +terminal.locationId);
              const doJob = await el.component[action]({now, owner, operatingMode});
              res.write(JSON.stringify(doJob));
            } else {
              const err = `[SERVER]: environment not found LIST: [${environments.map(el => { return el[environmentType].id })}], ? = ${parent.id}`;
              console.log(err);
              res.write(err);
            }
          }
        break;
        case '/system':
          switch (action){
            case 'set-mode':
              const mode = +q.query.mode as number;
              const doJob = await self.updateOperatingMode(mode);
              res.write(JSON.stringify(doJob));
            break;
            default:
            break;
          }
        break;
        default:
        break;
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
