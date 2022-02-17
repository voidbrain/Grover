import DbService from '../../../services/db/db.service'; 
import TemperatureComponent from '../../probes/temperature/temperature';
// import PhProbe from '../../probes/ph/ph';
// import EcProbe from '../../probes/ec/ec';
// import WaterLevel from '../../probes/water-level/water-level';
// import WaterLoop from '../../actuators/water-loop/water-loop';
import WaterRefillComponent from '../../actuators/water-refill/water-refill';
// import PhBalancer from '../../actuators/ph-balancer/ph-balancer';
// import EcBalancer from '../../actuators/ec-balancer/ec-balancer';

import { LocationInterface } from '../../../interfaces/location';
import { PotInterface } from '../../../interfaces/pot';
import { WaterRefillInterface } from '../../../interfaces/water-refill';

class PotComponent {
  db = new DbService();
  pot: PotInterface = null;
  location: LocationInterface = null;
  probes:any[] = [];
  workers :any[]= [];
  // params: PotInterface;
  // // waterRefill: WaterRefillComponent;
  // id: number;
  // type: string;
  // probes = [];
  // actuators = [];

  // name: string;
  // isBlooming: boolean;
  // enabled: boolean;
  // deleted: boolean;
  // lastUpdate: number;
  // idRoom: number;
  locationId: number;

  constructor(
    // id, 
    // type,
    // waterTemperatureProbeId, 
    // waterTemperatureProbeSchedule,
    // /* 
    // waterLevelProbeTriggerPin, waterLevelProbeEchoPin, 
    // phProbeID, 
    // ecProbeID, 
    // waterLevelProbeID,
    // waterLoopID,
    // */ 
    // waterRefillDNum,
    // waterRefillEnPin,
    // waterRefillIn1Pin,
    // waterRefillIn2Pin,

    // name,
    // isBlooming,
    // enabled,
    // deleted,
    // lastUpdate,
    // idRoom,
    /*, 
    phBalancerID, 
    ecBalancerID 
    */ 
    db
  ) {
    
    // this.waterRefill = { waterRefillDNum, waterRefillEnPin, waterRefillIn1Pin, waterRefillIn2Pin };
    //// this.waterTemperature = new Temperature(waterTemperatureProbeId);
    // this.phProbe = new PhProbe(phProbeID);
    // this.ecProbe = new EcProbe(ecProbeID);
    // this.waterLevel = new WaterLevel(waterLevelProbeID, waterLevelProbeTriggerPin, waterLevelProbeEchoPin);
    // this.waterLoop = new WaterLoop(waterLoopID);
    //// this.waterRefill = new WaterRefill(waterRefillID);
    // this.phBalancer = new PhBalancer(phBalancerID);
    // this.ecBalancer = new EcBalancer(ecBalancerID);
  
    this.db = db;
    // this.setup(locationId);
  }

  async setup(locationId) {
    const self = this;
    self.locationId = locationId;
    const pot: PotInterface = await self.db.getItem("pots", locationId, 'locationId') as PotInterface;
    const location: LocationInterface = await self.db.getItem("locations", pot.locationId, 'id') as LocationInterface;

    const probesArr: any[] = await self.db.getItems('probes_list', pot.locationId, 'locationId') as any[];
    const workersArr: any[] = await self.db.getItems('workers_list', pot.locationId, 'locationId') as any[];
    probesArr.forEach(async (el) => {
      el.type =  await self.db.getItem('probes_type', el.probeType, 'id') as any;
      el.schedule = await self.db.getItem('probes_schedule', el.id, 'idProbe') as any;
      el.log =  await self.db.getItem('probes_log', el.id, 'idProbe') as any;
    });
    workersArr.forEach(async (el) => {
      el.type =  await self.db.getItem('workes_type', el.probeType, 'id') as any;
      el.schedule = await self.db.getItem('workers_schedule', el.id, 'idWorker') as any;
      el.log =  await self.db.getItem('probes_log', el.id, 'idWorker') as any;
    });
    self.pot = pot;
    self.location = location;
    self.probes = probesArr;
    self.workers = workersArr;

    console.log("00>", self.probes)
      
      // const pot = new PotComponent();

    // const potsLocation: LocationInterface[] = await self.db.getItems('locations', self.room.locationId, 'parent') as LocationInterface[];
    // console.log("potsLocation", potsLocation)
    // await Promise.all(
      // potsLocation.map(async location => {
        // const potsSetupParams: PotInterface = await self.db.getItem('pots', location.id) as PotInterface;
        // const pot = new PotComponent(potsSetupParams as undefined);
        // self.pots.push(pot); 
      // })
    // );

    // self.room.pots = self.pots;
  }

}
export default PotComponent;
