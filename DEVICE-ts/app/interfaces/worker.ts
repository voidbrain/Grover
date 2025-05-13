import { FanMotorInterface } from "./fan-motor";
import { WaterRefillInterface } from "./water-refill";
import { LightSwitchInterface } from "./light-switch";

export interface WorkerInterface {
  id?: number | string | undefined;
  type?: string;
  workerType?: number;
  component?: FanMotorInterface | WaterRefillInterface | LightSwitchInterface;
  address?: string;
  i2cAddress?: string | number;
  pin1?: number;
  pin2?: number;
  schedule?: object;

  waterLoop: object;

  log?: object[];
}
