/**
 * Grover/RedNeck System
 * Author: Voidbrain.net
 */

import LocationComponent from './app/hw-components/environment/location/location';
import RoomComponent from './app/hw-components/environment/room/room';

import WebServer from './app/services/webserver/webserver';
import WebClient from './app/services/webclient/webclient';

import { LocationInterface } from './app/interfaces/location';
import { RoomInterface }  from './app/interfaces/room';

class Main {
  mainClock  = 5 * 1000; // ms
  webServer = new WebServer();
  webClient = new WebClient();

  room: RoomComponent;
  pots: LocationComponent[];

  constructor(){
    this.appSetup();
  }

  async appSetup(){
    const pot1 = new LocationComponent({
      id: 'pot1',
      waterTemperatureProbeID: '28-0119140ee870',
      waterRefillDNum: 0,
      waterRefillEnPin: 14,
      waterRefillIn1Pin: 15,
      waterRefillIn2Pin: 18,       
    });
    const pot2 = new LocationComponent({
      id: 'pot2',
      waterTemperatureProbeID: '28-01191380b7f5',
      waterRefillDNum: 1,
      waterRefillEnPin: 21,
      waterRefillIn1Pin: 20,
      waterRefillIn2Pin: 16, 
    });

    this.pots = [pot1, pot2];
    this.room = new RoomComponent({
      id: 'room1',
      waterTemperatureProbeID: '28-01191380b7f5',
      waterRefillDNum: 1,
      waterRefillEnPin: 21,
      waterRefillIn1Pin: 20,
      waterRefillIn2Pin: 16, 
      locations: this.pots,
    });

    this.webServer.start();
    this.webServer.listen();

    this.webClient.callRemote('ping', 'START');
    this.mainLoop();
    
    
    // this.room.locations[0].actuators.waterRefill.doJob('forward', 100, 2000).then(() => {
    //   this.room.locations[1].actuators.waterRefill.doJob('backward', 100, 2000).then(() => {
    //   });
    // });
    
    // const e0 = await this.room.locations[0].actuators.waterRefill.doJob('forward', 100, 2000);
    // const e1 = await this.room.locations[1].actuators.waterRefill.doJob('backward', 100, 2000);
    
    // const e0 = this.room.locations[0].actuators.waterRefill.doJob('forward', 100, 2000);
    // const e1 = this.room.locations[1].actuators.waterRefill.doJob('backward', 100, 2000);
    
    const e1 = pot1.probes.waterTemperatureProbe.read();
    const e0 = await pot1.actuators.waterRefillProbe.run1ml();
    
    
  }
  mainLoop(){
    const self = this;
    setInterval(function(){
      self.room.locations.map((pot: LocationComponent)=>{
        pot.probes.waterTemperatureProbe.read().then((res: unknown)=>{
           console.log("Pot id: " + pot.id, " Value: " + res, pot.probes.waterTemperatureProbe.id);
        })
      });
    },  self.mainClock);
  }
}

const app = new Main();
