import { ProbesTypes, WorkersTypes } from '../../../services/settings/enums';

import { LocationInterface } from '../../../interfaces/location';
import { RoomInterface } from '../../../interfaces/room'; 

import { PotObject } from '../../../interfaces/pot'; 
import PotComponent from '../pot/pot'; 

import TemperatureComponent from '../../probes/temperature/temperature';
import LightSwitchComponent from '../../actuators/light-switch/light-switch';
import FanComponent from '../../actuators/fan-motor/fan-motor';

import RoomWaterRefillComponent from '../../actuators/room-water-refill/room-water-refill';
import RoomPhDownRefillComponent from '../../actuators/room-phdown-refill/room-phdown-refill';

import RoomGroRefillComponent from '../../actuators/room-gro-refill/room-gro-refill';
import RoomMicroRefillComponent from '../../actuators/room-micro-refill/room-micro-refill';
import RoomBloomRefillComponent from '../../actuators/room-bloom-refill/room-bloom-refill';
import RoomRipenRefillComponent from '../../actuators/room-ripen-refill/room-ripen-refill';

import RoomNutrientRefillComponent from '../../actuators/room-nutrient-refill/room-nutrient-refill';

class RoomComponent {
  db;
  api;
  settings;
  room: RoomInterface = null; 
  location: LocationInterface = null;
  probes:any[] = [];
  workers:any[] = [];
  pots: PotObject[] = [];
  primaryWaterPump: RoomWaterRefillComponent;
  primaryPhDownPump: RoomPhDownRefillComponent;
  primaryGroPump: RoomGroRefillComponent;
  primaryMicroPump: RoomMicroRefillComponent;
  primaryBloomPump: RoomBloomRefillComponent;
  primaryRipenPump: RoomRipenRefillComponent;
  primaryNutrientPump: RoomNutrientRefillComponent;
  serialNumber: string;
  
  constructor(
    serialNumber, db, api, settings
  ) {
    this.db = db;
    this.api = api;
    this.settings = settings;
    this.serialNumber = serialNumber;
  }

  async setup() {
    const self = this;
    const room: RoomInterface = await self.db.getItem("rooms", self.serialNumber, 'serialNumber') as RoomInterface;
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
            await probe.component.setup();
          break;
          case ProbesTypes.Water_level: 
            probe.component = null;
            // await probe.component.setup();
          break;
          case ProbesTypes.Water_temperature: 
            probe.component = new TemperatureComponent(room.id, room.name, probe.id, probe.address, schedule, self.db, self.api, self.settings)
            await probe.component.setup();
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
          case WorkersTypes.Room_Fan: 
            worker.component = new FanComponent(room.id, room.name, worker.id, worker.i2cAddress, worker.pin1, schedule, self.db, self.api, self.settings);
            await worker.component.setup();
          break;
          case WorkersTypes.Room_Light: 
            worker.component = new LightSwitchComponent(room.id, room.name, worker.id, worker.i2cAddress, worker.pin1, schedule, self.db, self.api, self.settings);
            await worker.component.setup();
          break;
          case WorkersTypes.Room_Water_refill: 
            worker.component = new RoomWaterRefillComponent(room.id, room.name, worker.id, worker.i2cAddress, worker.pin1, worker.pin2, schedule, self.db, self.api, self.settings)
            await worker.component.setup();
            self.primaryWaterPump = worker.component;
          break;
          case WorkersTypes.Room_PhDown_refill: 
            worker.component = new RoomPhDownRefillComponent(room.id, room.name, worker.id, worker.i2cAddress, worker.pin1, worker.pin2, schedule, self.db, self.api, self.settings)
            await worker.component.setup();
            self.primaryPhDownPump = worker.component;
          break;
          case WorkersTypes.Room_Gro_refill: 
            worker.component = new RoomGroRefillComponent(room.id, room.name, worker.id, worker.i2cAddress, worker.pin1, worker.pin2, schedule, self.db, self.api, self.settings)
            await worker.component.setup();
            self.primaryGroPump = worker.component;
          break;
          case WorkersTypes.Room_Micro_refill: 
            worker.component = new RoomMicroRefillComponent(room.id, room.name, worker.id, worker.i2cAddress, worker.pin1, worker.pin2, schedule, self.db, self.api, self.settings)
            await worker.component.setup();
            self.primaryMicroPump = worker.component;
          break;
          case WorkersTypes.Room_Bloom_refill: 
            worker.component = new RoomBloomRefillComponent(room.id, room.name, worker.id, worker.i2cAddress, worker.pin1, worker.pin2, schedule, self.db, self.api, self.settings)
            await worker.component.setup();
            self.primaryBloomPump = worker.component;
          break;
          case WorkersTypes.Room_Ripen_refill: 
            worker.component = new RoomRipenRefillComponent(room.id, room.name, worker.id, worker.i2cAddress, worker.pin1, worker.pin2, schedule, self.db, self.api, self.settings)
            await worker.component.setup();
            self.primaryRipenPump = worker.component;
          break;
          case WorkersTypes.Room_Nutrient_refill: 
            worker.component = new RoomNutrientRefillComponent(room.id, room.name, worker.id, 
              self.primaryGroPump, 
              self.primaryMicroPump,
              self.primaryBloomPump,
              self.primaryRipenPump,
              schedule, self.db, self.api, self.settings)
            await worker.component.setup();
            self.primaryNutrientPump = worker.component;
          break;
        }
      })
    );

    self.probes = probesArr;
    self.workers = workersArr;

    const potsLocation: LocationInterface[] = await self.db.getItems('locations', self.room.locationId, 'parent') as LocationInterface[];
    await Promise.all(
      potsLocation.map(async (el) => {
        const pot = new PotComponent(self.primaryWaterPump, self.primaryPhDownPump, self.primaryNutrientPump, self.db, this.api, self.settings) as unknown as PotObject;
        await pot.setup(el.id);
        self.pots.push(pot);
      })
    );
  }

}
export default RoomComponent;
