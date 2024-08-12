import { LocationInterface } from "./location";

export interface PotInterface {
  id: number;
  name: string;
  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
  locationId: number;
  location?: LocationInterface;
}
