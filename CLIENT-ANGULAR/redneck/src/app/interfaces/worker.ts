// import { FanMotorInterface } from "./fan-motor";
// import { WaterRefillInterface } from "./water-refill";
import { WaterLoopInterface } from "./water-loop";
import { WaterRefillInterface } from "./water-refill";


export interface WorkerLogRowInterface {
  executedTime: string;
  action: string;
  value: number;
}

export interface WorkerInterface {
  locationId: number;
  id?: number;
  type?: { minAcceptableValue: number; maxAcceptableValue: number };
  workerType?: number;
  // component?: unknown; //FanMotorInterface | WaterRefillInterface | LightSwitchInterface;
  address?: string;
  i2cAddress?: string | number;
  pin1?: number;
  pin2?: number;
  schedule?: unknown[];
  status?: string;

  waterLoop?: WaterLoopInterface; 
  refill?: WaterRefillInterface; 

  log?: WorkerLogRowInterface[]
  
}
