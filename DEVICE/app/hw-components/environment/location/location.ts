import { TemperatureInterface } from '../../../interfaces/temperature';
import { PhProbeInterface } from '../../../interfaces/ph-probe';
import { EcProbeInterface } from '../../../interfaces/ec-probe';

import { WaterRefillInterface } from '../../../interfaces/water-refill';
import { LightSwitchInterface } from '../../../interfaces/light-switch';

class LocationComponent {
  id: number;
  probes: TemperatureInterface | PhProbeInterface | EcProbeInterface [] = [];
  actuators: WaterRefillInterface | LightSwitchInterface [] = [];
  locationId: number
  name: string;
  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
  db;

  constructor(
    serialNumber: string,
    db
  ) {
    this.db = db;
  }

 }
 export default LocationComponent;
 