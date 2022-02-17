import DbService from '../../../services/db/db.service'; 
import WaterRefillComponent from '../../actuators/water-refill/water-refill';
import PotComponent from '../pot/pot'; 
import { RoomInterface } from '../../../interfaces/room'; 
import { PotObject } from '../../../interfaces/pot'; 
import { LocationInterface } from '../../../interfaces/location';
class RoomComponent {
  db = new DbService();
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
    db
  ) {
    this.db = db;
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
        const pot = new PotComponent(self.db) as unknown as PotObject;
        await pot.setup(el.id);
        self.pots.push(pot);
      })
    );
  }

 }
 export default RoomComponent;
 