/**
 * Pot Envoirement
 */

import Temperature from '../../probes/temperature/temperature';
// import PhProbe from '../../probes/ph/ph';
// import EcProbe from '../../probes/ec/ec';
// import WaterLevel from '../../probes/water-level/water-level';
// import WaterLoop from '../../actuators/water-loop/water-loop';
import WaterRefill from '../../actuators/water-refill/water-refill';
// import PhBalancer from '../../actuators/ph-balancer/ph-balancer';
// import EcBalancer from '../../actuators/ec-balancer/ec-balancer';

class Pot {
  constructor({potID, waterTemperatureProbeID, /* waterLevelProbeTriggerPin, waterLevelProbeEchoPin, phProbeID, ecProbeID, waterLevelProbeID,
    waterLoopID,*/ waterRefillID /*, phBalancerID, ecBalancerID */ }) {
    this.id = potID;
    //// this.waterTemperature = new Temperature(waterTemperatureProbeID);
    // this.phProbe = new PhProbe(phProbeID);
    // this.ecProbe = new EcProbe(ecProbeID);
    // this.waterLevel = new WaterLevel(waterLevelProbeID, waterLevelProbeTriggerPin, waterLevelProbeEchoPin);
    // this.waterLoop = new WaterLoop(waterLoopID);
    //// this.waterRefill = new WaterRefill(waterRefillID);
    // this.phBalancer = new PhBalancer(phBalancerID);
    // this.ecBalancer = new EcBalancer(ecBalancerID);
    this.probes = {
        waterTemperature: new Temperature(waterTemperatureProbeID),
    };
    this.actuators = {
        waterRefill : new WaterRefill(waterRefillID),
    };
  }
}
export default Pot;
