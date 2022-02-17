import { LocationInterface } from "./location";
export interface PotInterface {
  id: number;
  name: string;
  locationId: number;
  
  probes?: any[];
  workers?: any[];

  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;

  setup: (locationId) => {};
}
export interface PotObject extends LocationInterface, PotInterface {}
