// import { FanMotorInterface } from "./fan-motor";
// import { WaterRefillInterface } from "./water-refill";
import { WaterLoopInterface } from "./water-loop";
import { WaterRefillInterface } from "./water-refill";

export interface WorkerInterface {
  locationId: number;
  id?: number;
  type?: string;
  workerType?: number;
  // component?: unknown; //FanMotorInterface | WaterRefillInterface | LightSwitchInterface;
  address?: string;
  i2cAddress?: string | number;
  pin1?: number;
  pin2?: number;
  schedule?: object;
  status?: string;

  waterLoop?: WaterLoopInterface; 
  refill?: WaterRefillInterface; 
  
}
