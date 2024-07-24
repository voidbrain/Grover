import { PlantExtended } from '../interfaces/plant';
import { Location } from './location';

export interface Room {
  id: number;
  name: string;
  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
  plants: PlantExtended[];
}

export interface RoomExtended extends Room {
  location?: Location;
  locationId?: number;
  probes?;
  workers?;
  settings?: any;
  operatingMode?: number;
  operatingModes: any[];
  probesComponents: {
    airtemp: any;
  };
  workersComponents: {
    light: any;
    fan: any;
    nutrientRefill: any;
    phDown: any;
  };
  visible?: boolean;
  isBlooming?: boolean;
  isVegetative?: boolean;
  isNursery?: boolean;
  isHarvested?: boolean;
  serialNumber?: any;
}


// PH = 5.8 +/- 0.5
