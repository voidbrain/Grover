import { Location } from './location';
export interface Pot {
  id: number;
  name: string;
  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
  locationId: number;
  location?: Location;
}
