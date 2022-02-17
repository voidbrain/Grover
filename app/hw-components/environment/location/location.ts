import DbService from '../../../services/db/db.service'; 
 
 // import PhProbe from '../../probes/ph/ph';
 // import EcProbe from '../../probes/ec/ec';
 // import WaterLevel from '../../probes/water-level/water-level';
 // import WaterLoop from '../../actuators/water-loop/water-loop';
 import WaterRefillComponent from '../../actuators/water-refill/water-refill';
 import PotComponent from '../pot/pot';
 // import PhBalancer from '../../actuators/ph-balancer/ph-balancer';
 // import EcBalancer from '../../actuators/ec-balancer/ec-balancer';
 
import { LocationInterface } from '../../../interfaces/location';
// import { WaterRefillInterface } from '../../../interfaces/water-refill';
// import TemperatureComponent from '../../probes/temperature/temperature';
 
class LocationComponent {
  id: number;
  probes = [];
  actuators = [];
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
 