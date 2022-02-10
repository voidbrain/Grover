// sudo node --loader ts-node/esm --experimental-specifier-resolution=node ./index.ts

import SettingsService from './app/services/settings/settings.service';
import WebServer from './app/services/webserver/webserver';
import DbService from './app/services/db/db.service';
import ApiService from './app/services/api/api.service';
import NetworkService from './app/services/network/network.service';

import { LocationInterface } from './app/interfaces/location';
import { RoomInterface }  from './app/interfaces/room';

import LocationComponent from './app/hw-components/environment/location/location';
import RoomComponent from './app/hw-components/environment/room/room';

class Main {

  room: RoomComponent;
  pots: LocationComponent[];
  clock: number;
  webServer = new WebServer();
  settings = new SettingsService();
  db = new DbService(this.settings, new ApiService(new NetworkService(), this.settings));
  

  constructor(
  ){
    this.appSetup();
  }

  async appSetup(){
    this.clock = this.settings.getClock();

    const initializerPot1: LocationInterface = {
      id: 'pot1',
      waterTemperatureProbeID: '28-0119140ee870',
      waterTemperatureProbeSchedule: [{
        cron: '*/10 * * * * *', 
        action: 'read',
        options: {
          busy: true
        },
      }],
      waterRefillDNum: 0,
      waterRefillEnPin: 14,
      waterRefillIn1Pin: 15,
      waterRefillIn2Pin: 18,
    }
    const pot1 = new LocationComponent(initializerPot1);

    const initializerPot2 = {
      id: 'pot2',
      waterTemperatureProbeID: '28-01191380b7f5',
      waterTemperatureProbeSchedule: [{
        cron: '*/20 * * * * *', 
        action: 'read',
        options: {},
      }],
      waterRefillDNum: 1,
      waterRefillEnPin: 21,
      waterRefillIn1Pin: 20,
      waterRefillIn2Pin: 16, 
    }
    const pot2 = new LocationComponent(initializerPot2);

    this.pots = [pot1, pot2];

    const initializerRoom: RoomInterface = {
      id: 'room1',
      waterTemperatureProbeID: '28-01191380b7f5',
      waterTemperatureProbeSchedule: [{
        cron: '*/20 * * * * *', 
        action: 'read',
        options: {},
      }],
      waterRefillDNum: 1,
      waterRefillEnPin: 21,
      waterRefillIn1Pin: 20,
      waterRefillIn2Pin: 16, 
      locations: this.pots,
    }
    this.room = new RoomComponent(initializerRoom);

    this.webServer.start();
    this.webServer.listen();
   
    // this.api.callRemote('START');
    
    // const e1 = pot1.probes.waterTemperatureProbe.read();
    // const e0 = await pot1.actuators.waterRefillProbe.run1ml();

    const initiDb = this.db.load().then(() => {
      console.log('[main] => initdb done');
    })
    .catch(() => {
      console.error('[main] => initdb error');
    })

    // const getCalendars = await this.db.getItems('calendars');
    
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
}

const app = new Main();
