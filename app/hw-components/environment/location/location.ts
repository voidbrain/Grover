/**
 * Location Environment
 */

 import Temperature from '../../probes/temperature/temperature';
 // import PhProbe from '../../probes/ph/ph';
 // import EcProbe from '../../probes/ec/ec';
 // import WaterLevel from '../../probes/water-level/water-level';
 // import WaterLoop from '../../actuators/water-loop/water-loop';
 import WaterRefill from '../../actuators/water-refill/water-refill';
 // import PhBalancer from '../../actuators/ph-balancer/ph-balancer';
 // import EcBalancer from '../../actuators/ec-balancer/ec-balancer';
 
 class Location {
  id: string;
  probes: {};
  actuators: {};
//    probes: {
//      waterTemperatureProbeID: Temperature,
//      phProbeID: number, 
//      ecProbeID: number,
//      waterLevelProbeID: number,
//    }
//    actuators: {
//      waterRefillID: WaterRefill,
//      waterLevelProbeTriggerPin: number,
//      waterLevelProbeEchoPin: number,
//    }
 
  constructor({
    id, 
    waterTemperatureProbeID, 
    /* 
    waterLevelProbeTriggerPin, waterLevelProbeEchoPin, 
    phProbeID, 
    ecProbeID, 
    waterLevelProbeID,
    waterLoopID,
    */ 
    waterRefillDNum,
    waterRefillEnPin,
    waterRefillIn1Pin,
    waterRefillIn2Pin,
    /*, 
    phBalancerID, 
    ecBalancerID 
    */ 
  }) {
     this.id = id;
     //// this.waterTemperature = new Temperature(waterTemperatureProbeID);
     // this.phProbe = new PhProbe(phProbeID);
     // this.ecProbe = new EcProbe(ecProbeID);
     // this.waterLevel = new WaterLevel(waterLevelProbeID, waterLevelProbeTriggerPin, waterLevelProbeEchoPin);
     // this.waterLoop = new WaterLoop(waterLoopID);
     //// this.waterRefill = new WaterRefill(waterRefillID);
     // this.phBalancer = new PhBalancer(phBalancerID);
     // this.ecBalancer = new EcBalancer(ecBalancerID);
     this.probes = {
       waterTemperatureProbe: new Temperature(waterTemperatureProbeID),
       phProbeID: null, 
       ecProbeID: null,
       waterLevelProbeID: null,
     };
     this.actuators = {
       waterRefill: new WaterRefill(waterRefillDNum, waterRefillEnPin, waterRefillIn1Pin, waterRefillIn2Pin),
       waterLevelProbeTriggerPin: null,
       waterLevelProbeEchoPin: null,
     };
   }
 }
 export default Location;
 