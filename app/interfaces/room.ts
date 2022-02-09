// import { LocationInterface } from './location';
// import { TemperatureInterface } from './temperature';
// import { WaterRefillInterface } from './water-refill';
// import { LightSwitchInterface } from './light-switch';
// import { FanMotorInterface } from './fan-motor';
// import { WaterLevelInterface } from './water-level';
// import { PhProbeInterface } from './ph-probe';
// import { EcProbeInterface } from './ec-probe';

// export interface RoomInterface {
//   id: number;
//   probes: {
//     waterTemperatureProbe: TemperatureInterface,
//     environmentTemperatureProbe: TemperatureInterface,
//     // phProbe: PhProbeInterface,
//     // ecProbe: EcProbeInterface,
//     // waterLevelProbe: WaterLevelInterface
//   };
//   actuators: {
//     waterRefill: WaterRefillInterface,
//     // lightSwitch: LightSwitchInterface,
//     // fanMotor: FanMotorInterface,
//   };  
//   locations: LocationInterface[];  
// }
import { TemperatureInterface } from './temperature';
import { WaterRefillInterface } from './water-refill';

import TemperatureComponent  from '../hw-components/probes/temperature/temperature';
import LocationComponent  from '../hw-components/environment/location/location';

export interface RoomInterface {
  id: string;
  probes: {
    waterTemperatureProbe: TemperatureComponent,
    phProbeID: number,
    ecProbeID: number,
    waterLevelProbeID: number
  };
  actuators: {
    waterRefillProbe: WaterRefillInterface,
    waterLevelProbeTriggerPin: number;
    waterLevelProbeEchoPin: number;
  };
  locations: LocationComponent;
}
