// /**
//  * Room Environment
//  */

// import { RoomInterface } from '../../../interfaces/room';
// import { LocationInterface } from '../../../interfaces/location';
// import { WaterRefillInterface } from '../../../interfaces/water-refill';

// import TemperatureComponent from '../../probes/temperature/temperature';
// import WaterLevelComponent from '../../probes/water-level/water-level';
// import PhProbeComponent from '../../probes/ph/ph';
// import EcProbeComponent from '../../probes/ec/ec';

// import LightSwitchComponent from '../../actuators/light-switch/light-switch';
// import FanMotorComponent from '../../actuators/fan-motor/fan-motor';
// import WaterRefillComponent from '../../actuators/water-refill/water-refill';

// class RoomComponent {
//   room: RoomInterface;
//   waterRefill: WaterRefillInterface;
//   id: number;
//   probes: any;
//   actuators: any;
   
//   constructor(
//     id: number,
//     waterLevelID: number,
//     triggerPin: number,
//     echoPin: number,

//     waterRefillDNum: number,
//     waterRefillEnPin: number,
//     waterRefillIn1Pin: number,
//     waterRefillIn2Pin: number,

//     waterTemperatureProbeID: number, environmentTemperatureProbeID: number, lightSwitchID: number, fanMotorID: number, locations: LocationInterface[]
//     ) {
//     this.room = {
//       id: id,
//       probes: {
//         waterTemperatureProbe: new TemperatureComponent(waterTemperatureProbeID),
//         environmentTemperatureProbe: new TemperatureComponent(environmentTemperatureProbeID),
//         // phProbe: new PhProbeComponent(triggerPin, echoPin),
//         // ecProbe: new EcProbeComponent(triggerPin, echoPin),
//         // waterLevelProbe: new WaterLevelComponent(waterLevelID, triggerPin, echoPin),
//       },
//       actuators: {
//         waterRefill: new WaterRefillComponent(waterRefillDNum, waterRefillEnPin, waterRefillIn1Pin, waterRefillIn2Pin),
//         // lightSwitch: new LightSwitchComponent(lightSwitchID),
//         // fanMotor: new FanMotorComponent(fanMotorID),
//       },
//       locations: locations,
//     }
//   }
// }
// export default RoomComponent;

/**
 * Location Environment
 */

 // import PhProbe from '../../probes/ph/ph';
 // import EcProbe from '../../probes/ec/ec';
 // import WaterLevel from '../../probes/water-level/water-level';
 // import WaterLoop from '../../actuators/water-loop/water-loop';
 import WaterRefillComponent from '../../actuators/water-refill/water-refill';
 import LocationComponent from '../location/location';
 // import PhBalancer from '../../actuators/ph-balancer/ph-balancer';
 // import EcBalancer from '../../actuators/ec-balancer/ec-balancer';
 
import { RoomInterface } from '../../../interfaces/room';
import { WaterRefillInterface } from '../../../interfaces/water-refill';
import TemperatureComponent from '../../probes/temperature/temperature';
 
class RoomComponent {
  id: number;
  waterRefill: WaterRefillInterface;
  probes: any;
  actuators: any;
  locations: LocationComponent[];

  constructor({
    id, 
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
    this.probes = {
      waterTemperatureProbe: new TemperatureComponent(id, waterTemperatureProbeID, waterTemperatureProbeSchedule),
      phProbeID: null, 
      ecProbeID: null,
      waterLevelProbeID: null,
    };
    this.actuators = {
      waterRefillProbe: new WaterRefillComponent(waterRefillDNum, waterRefillEnPin, waterRefillIn1Pin, waterRefillIn2Pin),
      waterLevelProbeTriggerPin: null,
      waterLevelProbeEchoPin: null,
    };
    // this.locations = locations;  
    }

    setLocations(locations) {
      this.locations = locations;
    }
 }
 export default RoomComponent;
 