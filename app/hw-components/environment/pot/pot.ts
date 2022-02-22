import { ProbesTypes, WorkersTypes } from '../../../services/settings/enums';

import TemperatureComponent from '../../probes/temperature/temperature';
// import PhProbe from '../../probes/ph/ph';
// import EcProbe from '../../probes/ec/ec';
// import WaterLevel from '../../probes/water-level/water-level';

import WaterLoopComponent from '../../actuators/water-loop/water-loop';
import RefillComponent from '../../actuators/water-refill/water-refill';
import RoomWaterRefillComponent from '../../actuators/room-water-refill/room-water-refill';
import RoomPhDownRefillComponent from '../../actuators/room-phdown-refill/room-phdown-refill';
import RoomNutrientRefillComponent from '../../actuators/room-nutrient-refill/room-nutrient-refill';

import { LocationInterface } from '../../../interfaces/location';
import { PotInterface } from '../../../interfaces/pot';
import { RoomInterface } from '../../../interfaces/room';

class PotComponent {
  room: RoomInterface;
  primaryWaterPump: RoomWaterRefillComponent;
  primaryPhDownPump: RoomPhDownRefillComponent;
  primaryNutrientPump: RoomNutrientRefillComponent;
  db;
  api;
  pot: PotInterface = null;
  location: LocationInterface = null;
  probes:any[] = [];
  workers :any[]= [];
  settings;
  locationId: number;

  constructor(
    primaryWaterPump, primaryPhDownPump, primaryNutrientPump, db, api, settings
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
    
    this.primaryWaterPump = primaryWaterPump;
     this.primaryPhDownPump = primaryPhDownPump;
     this.primaryNutrientPump = primaryNutrientPump;
    this.db = db;
    this.api = api;
    this.settings = settings;
    // this.setup(locationId);
  }

  async setup(locationId) {
    const self = this;
    

    self.locationId = locationId;
    const pot: PotInterface = await self.db.getItem("pots", locationId, 'locationId') as PotInterface;
    const location: LocationInterface = await self.db.getItem("locations", pot.locationId, 'id') as LocationInterface;

    const probesArr: any[] = await self.db.getItems('probes_list', pot.locationId, 'locationId') as any[];
    const workersArr: any[] = await self.db.getItems('workers_list', pot.locationId, 'locationId') as any[];

    await Promise.all(
      probesArr.map(async (probe) => {
        probe.type =  await self.db.getItem('probes_type', probe.probeType, 'id') as any;
        probe.logs = await self.db.getItems('probes_log', probe.id, 'idProbe') as unknown as any[];
        const schedule: any[] = await self.db.getItems('probes_schedule', probe.id, 'idProbe') as unknown as any[];
        
        switch(probe.probeType) {
          case ProbesTypes.Water_level: 
            probe.component = null;
            // await probe.component.setup();
          break;
          case ProbesTypes.Water_temperature: 
            probe.component = new TemperatureComponent(pot.id, pot.name, probe.id, probe.address, schedule, self.db, self.api, self.settings)
            await probe.component.setup();
          break;
          case ProbesTypes.pH: 
            probe.component = null;
            // await probe.component.setup();
          break;
          case ProbesTypes.EC: 
            probe.component = null;
            // await probe.component.setup();
          break;
        }
      })
    );
    await Promise.all(
      workersArr.map(async (worker) => {
        worker.type =  await self.db.getItem('workers_type', worker.workerType, 'id') as any;
        worker.logs = await self.db.getItems('workers_log', worker.id, 'idworker') as unknown as any[];

        const schedule: any[] = await self.db.getItems('workers_schedule', worker.id, 'idworker') as unknown as any[];
        switch(worker.workerType) {
          // case WorkersTypes.Nutrient_refill: 
          //   worker.component = null;
          //   // await worker.component.setup();
          // break;
          // case WorkersTypes.PHdown_refill: 
          //   worker.component = null;
          //   // await worker.component.setup();
          // break;
          case WorkersTypes.Water_loop: 
            worker.component = new WaterLoopComponent(pot.id, pot.name, worker.id, worker.i2cAddress, worker.pin1, schedule, self.db, self.api, self.settings);
            await worker.component.setup();
          break;
          case WorkersTypes.Pot_refill: 
            worker.component = new RefillComponent(self.primaryWaterPump, self.primaryPhDownPump, self.primaryNutrientPump, pot.id, pot.name, worker.id, worker.i2cAddress, worker.pin1, worker.pin2, schedule, self.db, self.api, self.settings)
            await worker.component.setup();
          break;
        }
      })
    );
    self.pot = pot;
    self.location = location;
    self.probes = probesArr;
    self.workers = workersArr;
  }

}
export default PotComponent;
