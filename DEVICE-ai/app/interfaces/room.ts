import { LocationInterface } from "./location";
import { PotObject } from "./pot";
import { ProbeInterface } from "./probe";
import { WorkerInterface } from "./worker";

export interface RoomInterface {
  id: number;
  name: string;
  isBlooming: boolean;
  serialNumber: string;
  locationId: number;

  probes: ProbeInterface[];
  workers: WorkerInterface[];
  pots: PotObject[];

  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
  parent: number;

  setup?: () => object;
}

export interface RoomObject extends LocationInterface, RoomInterface {}
