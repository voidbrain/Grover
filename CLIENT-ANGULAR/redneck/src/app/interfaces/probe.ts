// import { TemperatureInterface } from "../interfaces/temperature";
// import { WaterLevelInterface } from "./water-level";
// import { WaterRefillInterface } from "./water-refill";
// import { PhProbeInterface } from "./ph-probe";
// import { EcProbeInterface } from "./ec-probe";
// ProbeTypeInterface
// import { ProbeTypeInterface } from 
// // import { ProbesTypes } from "../services/settings/enum";

// export interface ProbeLogRowInterface {
//   executedTime: string;
//   action: string;
//   value: number;
// }

import { ProbeTypeInterface } from "./probeType";
import { ProbeLogInterface } from "./probeLog";
import { ProbeScheduleInterface } from "./probeSchedule";

export interface ProbeInterface {
    
       
         
    enabled: number,
    deleted: number,
    lastUpdate: number,
    address: string,
    pin1?: number,
    pin2?: number,
    i2cAddress?: number,


    locationId: number;
    id: number;
    probeType: number;
    // component?: unknown; // TemperatureComponent | PhProbeComponent | EcProbeComponent;
    // address: string;
    schedule?: ProbeScheduleInterface[];
    type: ProbeTypeInterface,
    // temp?: TemperatureInterface;
    // waterLevel?: WaterLevelInterface;
    // WaterRefill?: WaterRefillInterface;
    // ph?: PhProbeInterface;
    // ec?: EcProbeInterface;

    log?: ProbeLogInterface[]
  }
  