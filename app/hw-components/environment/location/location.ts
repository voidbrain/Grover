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
    // this.setup(serialNumber);

    // this.waterRefill = { waterRefillDNum, waterRefillEnPin, waterRefillIn1Pin, waterRefillIn2Pin };
    //// this.waterTemperature = new Temperature(waterTemperatureProbeId);
    // this.phProbe = new PhProbe(phProbeID);
    // this.ecProbe = new EcProbe(ecProbeID);
    // this.waterLevel = new WaterLevel(waterLevelProbeID, waterLevelProbeTriggerPin, waterLevelProbeEchoPin);
    // this.waterLoop = new WaterLoop(waterLoopID);
    //// this.waterRefill = new WaterRefill(waterRefillID);
    // this.phBalancer = new PhBalancer(phBalancerID);
    // this.ecBalancer = new EcBalancer(ecBalancerID);


    
     
     
    // this.id = id;
    // this.locationId = locationId;

    // probes.map(el => {
    //   console.log("[ROOM]: " + el)
    // })
    // this.probes = [
    //   // waterTemperatureProbe: new TemperatureComponent(id, type, waterTemperatureProbeId, waterTemperatureProbeSchedule),
    // ];
    // this.actuators = [
    //   // waterRefillProbe: new WaterRefillComponent(waterRefillDNum, waterRefillEnPin, waterRefillIn1Pin, waterRefillIn2Pin),
    
    // // this.locations = locations;  
    // ];
  }

  // async setup(serialNumber) {
  //   const self = this;
  //   const locationParams: LocationInterface = await self.db.getItem('rooms', serialNumber, 'deviceSerial') as LocationInterface;
  // }
 }
 export default LocationComponent;
 