// sudo node --loader ts-node/esm --experimental-specifier-resolution=node ./index.ts

import http from 'http';
import url from 'url';
import { LocalStorage } from 'node-localstorage';

import SettingsService from './app/services/settings/settings.service';
import DbService from './app/services/db/db.service';
import ApiService from './app/services/api/api.service';
import NetworkService from './app/services/network/network.service';

import { Owner } from './app/services/settings/enums';

import { LocationInterface } from './app/interfaces/location';
import { PotInterface } from './app/interfaces/pot';
import { RoomInterface }  from './app/interfaces/room';
import { RoomObject }  from './app/interfaces/room';

// import PotComponent from './app/hw-components/environment/pot/pot';

import RoomComponent from './app/hw-components/environment/room/room';
import LocationComponent from './app/hw-components/environment/location/location';

class Main {
  server: http.Server;
  webServerPort: number;
  serialNumber: string;

  room: any;
  rooms: any[] = [];
  pots: any[] = [];
  clock: number;
  settings = new SettingsService();
  db = new DbService();
  localStorage = new LocalStorage('./data/scratch');

  constructor(
  ){
    
    this.appSetup();
  }

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
    const lastUpdate = this.localStorage.getItem(this.settings.getAppName());
    
    // const loadDb = await self.db.load();
    console.log('[main] => initdb done');

    const remoteSettings: any = await self.db.api.get(endpoint, lastUpdate, action, self.serialNumber);
    const found = remoteSettings.device.find(el => el.device === self.serialNumber)
    if(!found) {
      console.log('device not found'); 
    } else {
      this.settings.setOperatingMode(remoteSettings["device"].mode);
      self.main();
    }
  }



  async main(){
    const self = this;
    self.room = new RoomComponent(self.db) as unknown as RoomObject;
    await self.room.setup(self.serialNumber)

    // console.log("[main]: room ", self.room);
   
    // this.api.callRemote('START');
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

      // self.emit('remoteCall', path, JSON.stringify(queryData));

      // self.on('callback',(data)=>{
      //   console.log('callback', data);
      //   // res.write('sei nel callback');
      //   // res.end();
      // });
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
