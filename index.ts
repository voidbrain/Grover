// sudo node --loader ts-node/esm --experimental-specifier-resolution=node ./index.ts

import http from 'http';
import url from 'url';

import SettingsService from './app/services/settings/settings.service';
import DbService from './app/services/db/db.service';
import ApiService from './app/services/api/api.service';
import NetworkService from './app/services/network/network.service';

import { Owner } from './app/services/settings/enums';

import { LocationInterface } from './app/interfaces/location';
import { RoomInterface }  from './app/interfaces/room';

import LocationComponent from './app/hw-components/environment/location/location';
import RoomComponent from './app/hw-components/environment/room/room';

class Main {
  server: http.Server;
  webServerPort: number;

  room: RoomComponent;
  rooms: RoomComponent[] = [];
  locations: LocationComponent[] = [];
  clock: number;
  settings = new SettingsService();
  db = new DbService(this.settings, new ApiService(new NetworkService(), this.settings));

  constructor(
  ){
    this.server = http.createServer();
    this.webServerPort = 8084;
    this.webServerSetup();
    
    this.db.load().then(() => {
      console.log('[main] => initdb done');
      this.appSetup();
    })
    .catch(() => {
      console.error('[main] => initdb error');
    })
    
  }

  async appSetup(){
    const self = this;
    self.clock = self.settings.getClock();

    const roomSetupParams: RoomInterface = await self.db.getItem('rooms', 1) as RoomInterface;
    roomSetupParams.type = 'rooms';
    const room = new RoomComponent(roomSetupParams as undefined);
    self.room = room;
    self.rooms.push(room);
    
    if(self.room?.id) {
      const locationsSetupParams: LocationInterface[] = await self.db.getItems('locations', self.room.id) as LocationInterface[];

      locationsSetupParams.forEach((locParams: LocationInterface) => {
        locParams.type = 'locations';
        const location = new LocationComponent(locParams as undefined);
        self.locations.push(location); 
      });

      self.room.locations = self.locations;
    }

   
   
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
      const el = self[type].find(el => el.id === +id);
      const item = el.probes[probe];
      const owner = Owner.user;
      const doJob = await item[action]({now, owner});
      console.log(JSON.stringify(doJob));
      res.write(JSON.stringify(doJob));
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
