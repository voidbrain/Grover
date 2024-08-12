export interface PotInterface {
  id: number;
  name: string;
  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
  locationId: number;
  location?: Location;
}
