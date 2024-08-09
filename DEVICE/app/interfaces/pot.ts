import { LocationInterface } from "./location";
import { EcProbeInterface } from "./ec-probe";
import { PhProbeInterface } from "./ph-probe";
import { TemperatureInterface } from "./temperature";
export interface PotInterface {
  id: number;
  name: string;
  locationId: number;

  probes: (EcProbeInterface | PhProbeInterface | TemperatureInterface)[];
  workers: object[];

  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
  parent: number;

  setup: (locationId) => object;
}
export interface PotObject extends LocationInterface, PotInterface {}
