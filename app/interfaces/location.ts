import { TemperatureInterface } from './temperature';
import { WaterRefillInterface } from './water-refill';

import TemperatureComponent  from '../hw-components/probes/temperature/temperature';
import WaterRefillComponent  from '../hw-components/actuators/water-refill/water-refill';

export interface LocationInterface {
  id: string;
  probes: {
    waterTemperatureProbe: TemperatureComponent,
    phProbeID: number,
    ecProbeID: number,
    waterLevelProbeID: number
  };
  actuators: {
    waterRefillProbe: WaterRefillComponent,
    waterLevelProbeTriggerPin: number;
    waterLevelProbeEchoPin: number;
  };
}
