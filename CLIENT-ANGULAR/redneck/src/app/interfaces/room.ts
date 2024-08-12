import { PlantExtendedInterface } from '../interfaces/plant';
import { FanMotorInterface } from './fan-motor';
import { LightSwitchInterface } from './light-switch';
import { ProbeInterface } from './probe';
import { TemperatureInterface } from './temperature';
import { WaterRefillInterface } from './water-refill';
import { WorkerInterface } from './worker';

export interface RoomInterface {
  id: number;
  name: string;
  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
  plants: PlantExtendedInterface[];
}

export interface RoomExtendedInterface extends RoomInterface {
  location?: Location;
  locationId?: number;
  probes?: ProbeInterface[];
  workers?: WorkerInterface[];
  settings?: unknown;
  operatingMode?: number;
  operatingModes: number[];
  probesComponents: {
    airtemp: TemperatureInterface;
  };
  workersComponents: {
    light: LightSwitchInterface;
    fan: FanMotorInterface;
    nutrientRefill: WaterRefillInterface;
    phDown: WaterRefillInterface;
  };
  visible?: boolean;
  isBlooming?: boolean;
  isVegetative?: boolean;
  isNursery?: boolean;
  isHarvested?: boolean;
  serialNumber?: string;
  
}

// PH = 5.8 +/- 0.5
