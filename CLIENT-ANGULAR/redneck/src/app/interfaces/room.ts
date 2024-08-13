import { PlantExtendedInterface } from '../interfaces/plant';
import { FanMotorInterface } from './fan-motor';
import { LightSwitchInterface } from './light-switch';
import { ProbeInterface } from './probe';
import { TemperatureInterface } from './temperature';
import { WaterRefillInterface } from './water-refill';
import { WorkerInterface } from './worker';
import { RoomSettingsInterface } from './settings';

export interface RoomInterface {
  id: number;
  name: string;
  enabled: number;
  deleted: number;
  lastUpdate: number;
  plants: PlantExtendedInterface[];
}

export interface operatingModeRow {
  name: string,
  value: number
}

export interface RoomExtendedInterface extends RoomInterface {
  // location?: Location;
  locationId?: number;
  probes?: ProbeInterface[];
  workers?: WorkerInterface[];
  settings?: RoomSettingsInterface;
  operatingMode?: number;
  operatingModes: operatingModeRow[];
  probesComponents: {
    airtemp: TemperatureInterface;
  };
  workersComponents: {
    light: LightSwitchInterface;
    fan: FanMotorInterface;
    nutrientRefill: WaterRefillInterface;
    phDown: WaterRefillInterface;
  };
  visible?: number | boolean;
  isBlooming?: number;
  isVegetative?: number;
  isNursery?: number;
  isHarvested?: number;
  serialNumber?: string;
  
}

// PH = 5.8 +/- 0.5
