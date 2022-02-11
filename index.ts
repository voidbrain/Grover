// sudo node --loader ts-node/esm --experimental-specifier-resolution=node ./index.ts

import http from 'http';
import url from 'url';

import SettingsService from './app/services/settings/settings.service';
import DbService from './app/services/db/db.service';
import ApiService from './app/services/api/api.service';
import NetworkService from './app/services/network/network.service';

import { LocationInterface } from './app/interfaces/location';
import { RoomInterface }  from './app/interfaces/room';

import LocationComponent from './app/hw-components/environment/location/location';
import RoomComponent from './app/hw-components/environment/room/room';

const Owner = {
  schedule: 'schedule',
  user: 'user'
};

class Main {
  server: http.Server;
  webServerPort: number;

  room: RoomComponent;
  rooms: RoomComponent[];
  locations: LocationComponent[];
  clock: number;
  settings = new SettingsService();
  db = new DbService(this.settings, new ApiService(new NetworkService(), this.settings));

  constructor(
  ){
    this.server = http.createServer();
    this.webServerPort = 8081;
    this.webServerSetup();
    
    this.db.load().then(() => {
      console.log('[main] => initdb done');
      this.appSetup();
    })
    .catch(() => {
      console.error('[main] => initdb error');
    })
    
  }

  isLocationInterface(arg: any): arg is LocationInterface {
    return arg && arg.prop;
  }
  isRoomInterface(arg: any): arg is LocationInterface {
    return arg && arg.prop;
  }

  async appSetup(){
    this.clock = this.settings.getClock();

    const roomSetupParams: RoomInterface = await this.db.getItem('rooms', 1);
    if(this.isRoomInterface(roomSetupParams)){
      const room =  new RoomComponent(roomSetupParams);
      this.rooms.push(room);
      this.room = this.rooms[0];
    }
    
    if(this.room?.id) {
      const locationsSetupParams: LocationInterface[] = await this.db.getItems('locations', this.room.id);
      locationsSetupParams.map((locParams: LocationInterface) => {
        if(this.isLocationInterface(locParams)) {
          const location = new LocationComponent(locParams);
          this.locations.push(location);
        } 
      });

      this.room.locations = this.locations;
    }
   
    // this.api.callRemote('START');
    console.log(`[main] => ready`);  
    // this.mainLoop();
  }

  // mainLoop(){
  //   const self = this;
  //   setInterval(function(){
  //     self.room.locations.map((pot: LocationComponent)=>{
  //       pot.probes.waterTemperatureProbe.read().then((res: unknown)=>{
  //          console.log("Pot id: " + pot.id, " Value: " + res, pot.probes.waterTemperatureProbe.id);
  //       })
  //     });
  //   },  self.clock);
  // }

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
      const path = q.pathname;
      const queryData = q.query;
      const now = new Date();
      const r = await this.room.locations[0].probes.waterTemperatureProbe.read(now, Owner.user);
      res.write('owner');
      res.write(JSON.stringify(r));
      console.log('owner');
      console.log(JSON.stringify(r));
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
export default Main;
