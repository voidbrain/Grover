import { LocationInterface } from "./location";
import { PotObject } from "./pot";

export interface RoomInterface {
  id: number;
  name: string;
  isBlooming: boolean;
  serialNumber: string;
  locationId: number;
  
  // probes: any[];
  // workers: any[];
  pots: PotObject[];

  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
  
  setup: (serialNumber) => {};
}

export interface RoomObject extends LocationInterface, RoomInterface {}
