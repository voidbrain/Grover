/**
 * Grover/RedNeck System
 * Author: Voidbrain.net
 */

import Pot from './app/envoirement/pot/pot';
import Room from './app/envoirement/room/room';
import Server from './app/services/server/server';

class Main {
  constructor(){
    this.mainClock = 5 * 1000; // ms
    this.server = new Server();
    this.appSetup();
  }
  appSetup(){
    this.pot1 = new Pot({
      potID: 'pot1',
      waterTemperatureProbeID: '28-0114502296aa',
      waterLevelProbeTriggerPin: 1,
      waterLevelProbeEchoPin: 2,
      phProbeID: 'pot1PhProbeID',
      ecProbeID: 'pot1ECProbeID',
      waterLevelProbeID: 'pot1WaterLevelProbeID',
      waterLoopID: 'pot1WaterLoopID',
      waterRefillID: 'pot1WaterRefillID',
      phBalancerID: 'pot1PhBalancerID',
      ecBalancerID: 'pot1EcBalancerID',
    });
    this.pot2 = new Pot({
      potID: 'pot2',
      waterTemperatureProbeID: '28-0114504ea1aa',
      waterLevelProbeTriggerPin: 3,
      waterLevelProbeEchoPin: 4,
      phProbeID: 'pot2PhProbeID',
      ecProbeID: 'pot2ECProbeID',
      waterLevelProbeID: 'pot2WaterLevelProbeID',
      waterLoopID: 'pot1WaterLoopID',
      waterRefillID: 'pot2WaterRefillID',
      phBalancerID: 'pot2PhBalancerID',
      ecBalancerID: 'pot2EcBalancerID',
    });
    this.room = new Room({
      roomID: 1,
      waterTemperatureProbeID: null,
      envoirementTemperatureProbeId: null,
      lightSwitchID: null,
      fanMotorID: null
    });

    this.server.startServer();
    this.server.listen();
    this.server.on('remoteCall', (path, queryData) => {
      console.log('remoteCall', path, queryData);
      this.server.emit('callback', 'ok')
    });
    this.server.callRemote('strains', 'START');
    this.mainLoop();
  }
  mainLoop(){
    const self = this;
    setInterval(function(){
        self.pot1.waterTemperature.getTemperature().then(res=>{
         console.log('pot1WaterTemp', res);
       });
       self.pot1.waterLevel.getWaterLevelMeasure().then(res=>{
         console.log('pot1WaterLevel',res);
       });

       self.pot2.waterTemperature.getTemperature().then(res=>{
         console.log('pot1WaterTemp', res);
       });

       console.log('\n');
    }, self.mainClock);
  }
}

const app = new Main();
