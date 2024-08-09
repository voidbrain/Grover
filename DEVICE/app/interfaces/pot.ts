import { LocationInterface } from "./location";
export interface PotInterface {
  id: number;
  name: string;
  locationId: number;

  probes: object[];
  workers: object[];

  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;

  setup: (locationId) => object;
}
export interface PotObject extends LocationInterface, PotInterface {}
