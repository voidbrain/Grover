import { LocationInterface } from "./location";
import { WorkerInterface } from "./worker";
import { ProbeInterface } from "./probe";
export interface PotInterface {
  id: number;
  name: string;
  locationId: number;

  probes: ProbeInterface[];
  workers: WorkerInterface[];

  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
  parent: number;

  setup: (locationId) => object;
}
export interface PotObject extends LocationInterface, PotInterface {}
