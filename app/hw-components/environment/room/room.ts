import { ProbesTypes, WorkersTypes } from '../../../services/settings/enums';

import { RoomInterface } from '../../../interfaces/room'; 
import { PotObject } from '../../../interfaces/pot'; 
import { LocationInterface } from '../../../interfaces/location';

import PotComponent from '../pot/pot'; 

import TemperatureComponent from '../../probes/temperature/temperature';

import RoomWaterRefillComponent from '../../actuators/room-water-refill/room-water-refill';
import LightSwitchComponent from '../../actuators/light-switch/light-switch';
import FanComponent from '../../actuators/fan-motor/fan-motor';
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
    serialNumber, db, api, settings
  ) {
    this.db = db;
    this.api = api;
    this.settings = settings;
    this.serialNumber = serialNumber;
    this.setup(serialNumber);
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

    await Promise.all(
      probesArr.map(async (probe) => {
        probe.type =  await self.db.getItem('probes_type', probe.probeType, 'id') as any;
        probe.logs = await self.db.getItems('probes_log', probe.id, 'idProbe') as unknown as any[];
        const schedule: any[] = await self.db.getItems('probes_schedule', probe.id, 'idProbe') as unknown as any[];
        
        switch(probe.probeType) {
          case ProbesTypes.Air_temperature: 
            probe.component = new TemperatureComponent(room.id, room.name, probe.id, probe.address, schedule, self.db, self.api, self.settings)
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
            worker.component = new FanComponent(room.id, room.name, worker.id, worker.i2cAddress, worker.pin1, schedule, self.db, self.api, self.settings);
          break;
          case WorkersTypes.Light: 
            worker.component = new LightSwitchComponent(room.id, room.name, worker.id, worker.i2cAddress, worker.pin1, schedule, self.db, self.api, self.settings);
          break;
          case WorkersTypes.Water_refill: 
            worker.component = new RoomWaterRefillComponent(room.id, room.name, worker.id, worker.i2cAddress, worker.pin1, worker.pin2, schedule, self.db, self.api, self.settings)
          break;
        }
      })
    );

    self.probes = probesArr;
    self.workers = workersArr;

    const primaryPump: RoomWaterRefillComponent = self.workers.find(el => {
      return el.workerType === WorkersTypes.Room_Water_refill;
    });

    const potsLocation: LocationInterface[] = await self.db.getItems('locations', self.room.locationId, 'parent') as LocationInterface[];
    await Promise.all(
      potsLocation.map(async (el) => {
        const pot = new PotComponent(primaryPump, self.db, this.api, self.settings) as unknown as PotObject;
        await pot.setup(el.id);
        self.pots.push(pot);
      })
    );
  
  }

}
export default RoomComponent;
