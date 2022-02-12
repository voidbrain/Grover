/**
 * Location Environment
 */

import TemperatureComponent from '../../probes/temperature/temperature';
// import PhProbe from '../../probes/ph/ph';
// import EcProbe from '../../probes/ec/ec';
// import WaterLevel from '../../probes/water-level/water-level';
// import WaterLoop from '../../actuators/water-loop/water-loop';
import WaterRefillComponent from '../../actuators/water-refill/water-refill';
// import PhBalancer from '../../actuators/ph-balancer/ph-balancer';
// import EcBalancer from '../../actuators/ec-balancer/ec-balancer';

import { LocationInterface } from '../../../interfaces/location';
import { WaterRefillInterface } from '../../../interfaces/water-refill';

class LocationComponent {
  params: LocationInterface;
  // waterRefill: WaterRefillComponent;
  id: number;
  type: string;
  probes: any;
  actuators: any;

  name: string;
  isBlooming: boolean;
  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
  idParent: number;

  constructor({
    id, 
    type,
    waterTemperatureProbeID, 
    waterTemperatureProbeSchedule,
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

    name,
    isBlooming,
    enabled,
    deleted,
    lastUpdate,
    idParent,
    /*, 
    phBalancerID, 
    ecBalancerID 
    */ 
  }) {
    // this.waterRefill = { waterRefillDNum, waterRefillEnPin, waterRefillIn1Pin, waterRefillIn2Pin };
    //// this.waterTemperature = new Temperature(waterTemperatureProbeID);
    // this.phProbe = new PhProbe(phProbeID);
    // this.ecProbe = new EcProbe(ecProbeID);
    // this.waterLevel = new WaterLevel(waterLevelProbeID, waterLevelProbeTriggerPin, waterLevelProbeEchoPin);
    // this.waterLoop = new WaterLoop(waterLoopID);
    //// this.waterRefill = new WaterRefill(waterRefillID);
    // this.phBalancer = new PhBalancer(phBalancerID);
    // this.ecBalancer = new EcBalancer(ecBalancerID);
  
    this.id = id;
    this.type = type;
    this.probes = {
      waterTemperatureProbe: new TemperatureComponent(id, type, waterTemperatureProbeID, waterTemperatureProbeSchedule),
      phProbeID: null, 
      ecProbeID: null,
      waterLevelProbeID: null,
    };
    this.actuators = {
      waterRefillProbe: new WaterRefillComponent(waterRefillDNum, waterRefillEnPin, waterRefillIn1Pin, waterRefillIn2Pin),
      waterLevelProbeTriggerPin: null,
      waterLevelProbeEchoPin: null,
    };
  
    name = this.name;
    isBlooming = this.isBlooming;
    enabled = this.enabled;
    deleted = this.deleted;
    lastUpdate = this.lastUpdate;
    idParent = this.idParent;
  }
}
export default LocationComponent;
