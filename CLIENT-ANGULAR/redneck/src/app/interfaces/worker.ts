// import { FanMotorInterface } from "./fan-motor";
// import { WaterRefillInterface } from "./water-refill";

import { WorkerTypeInterface } from "./workerType";
import { WorkerLogInterface } from "./workerLog";
import { WorkerScheduleInterface } from "./workerSchedule";


export interface WorkerInterface {
  // locationId: number;
  // id?: number;
  // type?: { minAcceptableValue: number; maxAcceptableValue: number };
  // workerType?: number;
  // // component?: unknown; //FanMotorInterface | WaterRefillInterface | LightSwitchInterface;
  // address?: string;
  // i2cAddress?: string | number;
  // pin1?: number;
  // pin2?: number;
  // schedule?: unknown[];
  // status?: string;

  // waterLoop?: WaterLoopInterface; 
  // refill?: WaterRefillInterface; 

  // log?: WorkerLogRowInterface[]

  id: number,
  locationId: number,
  workerType: number,
  enabled: number,
  deleted: number,
  lastUpdate: number,
  pin1: number,
  pin2: number,
  i2cAddress: number,
  status: number,
  type: WorkerTypeInterface,
  log: WorkerLogInterface[],
  schedule: WorkerScheduleInterface[]
  
}
