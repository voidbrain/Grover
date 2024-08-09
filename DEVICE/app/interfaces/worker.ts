import { FanMotorInterface } from "./fan-motor";

export interface WorkerInterface {
  id: number | string;
  type?: string;
  workerType?: number;
  component?: FanMotorInterface;
  address?: string;
  i2cAddress?: string | number;
  pin1?: number;
  pin2?: number;
}
