import { ProbesTypes, WorkersTypes } from '../../../services/settings/enums';
import WaterRefillComponent from '../../actuators/water-refill/water-refill';
import PotComponent from '../pot/pot'; 
import { RoomInterface } from '../../../interfaces/room'; 
import { PotObject } from '../../../interfaces/pot'; 
import { LocationInterface } from '../../../interfaces/location';

import TemperatureComponent from '../../probes/temperature/temperature';
import LightSwitchComponent from '../../actuators/light-switch/light-switch';
class RoomComponent {
  db;
  api;
  settings;
  room: RoomInterface = null; 
  location: LocationInterface = null;
  probes:any[] = [];
  workers:any[] = [];
  pots: PotObject[] = [];

  // id: number;
  // isBlooming: boolean;
  serialNumber: string;
  // enabled: boolean;
  // deleted: boolean;
  // lastUpdate: number;
  



  constructor(
    db, api, settings
  ) {
    this.db = db;
    this.api = api;
    this.settings = settings;
    // this.setup(serialNumber);
  }

  async setup(serialNumber) {
    const self = this;
    self.serialNumber = serialNumber;
    const room: RoomInterface = await self.db.getItem("rooms", serialNumber, 'serialNumber') as RoomInterface;
    const location: LocationInterface = await self.db.getItem("locations", room.locationId, 'id') as LocationInterface;

    const probesArr: any[] = await self.db.getItems('probes_list', room.locationId, 'locationId') as any[];
    const workersArr: any[] = await self.db.getItems('workers_list', room.locationId, 'locationId') as any[];
    probesArr.forEach(async (el) => {
      el.schedule = await self.db.getItem('probes_schedule', el.id, 'idProbe') as any;
    });
    workersArr.forEach(async (el) => {
      el.schedule = await self.db.getItem('workers_schedule', el.id, 'idWorker') as any;
    });
    self.room = room;
    self.location = location;
    self.probes = probesArr;
    self.workers = workersArr;

    const potsLocation: LocationInterface[] = await self.db.getItems('locations', self.room.locationId, 'parent') as LocationInterface[];
    await Promise.all(
      potsLocation.map(async (el) => {
        const pot = new PotComponent(self.db, this.api, self.settings) as unknown as PotObject;
        await pot.setup(el.id);
        self.pots.push(pot);
      })
    );
    
    await Promise.all(
      probesArr.map(async (probe) => {
        probe.type =  await self.db.getItem('probes_type', probe.probeType, 'id') as any;
        probe.logs = await self.db.getItems('probes_log', probe.id, 'idProbe') as unknown as any[];
        const schedule: any[] = await self.db.getItems('probes_schedule', probe.id, 'idProbe') as unknown as any[];
        
        switch(probe.probeType) {
          case ProbesTypes.Air_temperature: 
            probe.component = null;
          break;
          case ProbesTypes.Water_level: 
            probe.component = null;
          break;
          case ProbesTypes.Water_temperature: 
            probe.component = new TemperatureComponent(room.id, room.name, probe.id, probe.address, schedule, self.db, self.api, self.settings)
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
          case WorkersTypes.Fan: 
            worker.component = null;
          break;
          case WorkersTypes.Lights: 
            worker.component = new LightSwitchComponent(room.id, room.name, worker.id, worker.i2cAddress, worker.pin1, schedule, self.db, self.api, self.settings)
          break;
          case WorkersTypes.Water_refill: 
            worker.component = new WaterRefillComponent(room.id, room.name, worker.id, worker.i2cAddress, worker.pin1, worker.pin2, schedule, self.db, self.api, self.settings)
          break;
        }
      })
    );
    self.room = room;
    self.location = location;
    self.probes = probesArr;
    self.workers = workersArr;
  }

}
export default RoomComponent;
