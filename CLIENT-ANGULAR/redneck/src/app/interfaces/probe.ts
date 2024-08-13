import { ProbeTypeInterface, ConstructorProbeTypeInterface } from "./probeType";
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
    schedule?: ProbeScheduleInterface[];
    type: ProbeTypeInterface | ConstructorProbeTypeInterface | undefined,
    log?: ProbeLogInterface[]
  }
  