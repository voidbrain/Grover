/**
 * Grover/RedNeck System
 * Author: Voidbrain.net
 */

 'use strict';

import Location from './app/hw-components/environment/location/location.js';
import Room from './app/hw-components/environment/room/room.js';

import WebServer from './app/services/webserver/webserver.js';
import WebClient from './app/services/webclient/webclient.js';

class Main {
  mainClock  = 5 * 1000; // ms
  webServer = new WebServer();
  webClient = new WebClient();

  room; 
  pots;

  constructor(){
    this.appSetup();
  }

  appSetup(){
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
      envoirementTemperatureProbeId: null,
      lightSwitchID: null,
      fanMotorID: null,
      pots: null
    });
    this.room.pots = this.pots;

    this.webServer.start();
    this.webServer.listen();

    this.webClient.callRemote('ping', 'START');

    this.mainLoop();
    
    // this.room.pots[1].actuators.waterRefill.setSpeed(100);
    // this.room.pots[1].actuators.waterRefill.forward();
    // setTimeout(() => {
    //   this.room.pots[1].actuators.waterRefill.stop();
    //   this.room.pots[0].actuators.waterRefill.setSpeed(100);
    // this.room.pots[0].actuators.waterRefill.forward();
    // setTimeout(() => {
    //   this.room.pots[0].actuators.waterRefill.stop();
    // }, 3000)
    // }, 3000)
    
  }
  mainLoop(){
    const self = this;
    setInterval(function(){
      self.room.pots.map((pot)=>{
        pot.probes.waterTemperatureProbe.read().then(res=>{
           console.log("Pot id: " + pot.id, " Value: " + res, pot.probes.waterTemperatureProbe.id);
        })
      });
    },  self.mainClock);
  }
}

const app = new Main();
