import { LocationInterface } from "./location";
import { PotObject } from "./pot";

export interface RoomInterface {
  id: number;
  name: string;
  isBlooming: boolean;
  serialNumber: string;
  locationId: number;

  probes: object[];
  workers: object[];
  pots: PotObject[];

  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;

  setup?: () => object;
}

export interface RoomObject extends LocationInterface, RoomInterface {}
