/**
 * Grover/RedNeck System
 * Author: Voidbrain.net
 */

import Location from './app/hw-components/environment/location/location';
import Room from './app/hw-components/environment/room/room';

import WebServer from './app/services/webserver/webserver';
import WebClient from './app/services/webclient/webclient';

class Main {
  mainClock  = 5 * 1000; // ms
  webServer = new WebServer();
  webClient = new WebClient();

  room;
  pots;

  constructor(){
    this.appSetup();
  }

  async appSetup(){
    const pot1 = new Location({
      id: 'pot1',
      waterTemperatureProbeID: '28-0119140ee870',
      // waterLevelProbeTriggerPin: 1,
      // waterLevelProbeEchoPin: 2,
      // phProbeID: 'pot1PhProbeID',
      // ecProbeID: 'pot1ECProbeID',
      // waterLevelProbeID: 'pot1WaterLevelProbeID',
      // waterLoopID: 'pot1WaterLoopID',

      waterRefillDNum: 0,
      waterRefillEnPin: 14,
      waterRefillIn1Pin: 15,
      waterRefillIn2Pin: 18, 
      
      // phBalancerID: 'pot1PhBalancerID',
      // ecBalancerID: 'pot1EcBalancerID',
    });
    const pot2 = new Location({
      id: 'pot2',
      waterTemperatureProbeID: '28-01191380b7f5',
      // waterLevelProbeTriggerPin: 1,
      // waterLevelProbeEchoPin: 2,
      // phProbeID: 'pot1PhProbeID',
      // ecProbeID: 'pot1ECProbeID',
      // waterLevelProbeID: 'pot1WaterLevelProbeID',
      // waterLoopID: 'pot1WaterLoopID',

      waterRefillDNum: 1,
      waterRefillEnPin: 21,
      waterRefillIn1Pin: 20,
      waterRefillIn2Pin: 16, 
      
      // phBalancerID: 'pot1PhBalancerID',
      // ecBalancerID: 'pot1EcBalancerID',
    });

    this.pots = [pot1, pot2];
    this.room = new Room({
      roomID: 1,
      waterTemperatureProbeID: null,
      environmentTemperatureProbeID: null,
      lightSwitchID: null,
      fanMotorID: null,
      locations: this.pots
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
    const e0 = await this.room.locations[0].actuators.waterRefill.run1ml('forward');
    
  }
  mainLoop(){
    const self = this;
    setInterval(function(){
      self.room.locations.map((pot)=>{
        pot.probes.waterTemperatureProbe.read().then(res=>{
           console.log("Pot id: " + pot.id, " Value: " + res, pot.probes.waterTemperatureProbe.id);
        })
      });
    },  self.mainClock);
  }
}

const app = new Main();
