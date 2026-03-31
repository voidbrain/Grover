import { ProbesTypes, WorkersTypes } from "../../../services/settings/enums";

import { LocationInterface } from "../../../interfaces/location";
import { RoomInterface } from "../../../interfaces/room";

import PotComponent from "../pot/pot";

import TemperatureComponent from "../../probes/temperature/temperature";
import LightSwitchComponent from "../../actuators/light-switch/light-switch";
import FanComponent from "../../actuators/fan-motor/fan-motor";

import RoomWaterRefillComponent from "../../actuators/room-water-refill/room-water-refill";
import RoomPhDownRefillComponent from "../../actuators/room-phdown-refill/room-phdown-refill";

import RoomGroRefillComponent from "../../actuators/room-gro-refill/room-gro-refill";
import RoomMicroRefillComponent from "../../actuators/room-micro-refill/room-micro-refill";
import RoomBloomRefillComponent from "../../actuators/room-bloom-refill/room-bloom-refill";
import RoomRipenRefillComponent from "../../actuators/room-ripen-refill/room-ripen-refill";

import RoomNutrientRefillComponent from "../../actuators/room-nutrient-refill/room-nutrient-refill";
import { ProbeInterface } from "../../../interfaces/probe";
import { WorkerInterface } from "../../../interfaces/worker";

import { DbService } from "../../../services/db/db.service";
import { ApiService } from "../../../services/api/api.service";
import { SettingsService } from "../../../services/settings/settings.service";
// import { ProbeType } from "../../../interfaces/probe-type";
// import { WorkerType } from "../../../interfaces/worker-type";

class RoomComponent {
  db: DbService;
  api: ApiService;
  settings: SettingsService;
  room: RoomInterface | null = null;
  location: LocationInterface | null = null;
  probes: ProbeInterface[] = [];
  workers: WorkerInterface[] = [];
  pots: PotComponent[] = [];
  primaryWaterPump: RoomWaterRefillComponent | null = null;
  primaryPhDownPump: RoomPhDownRefillComponent | null = null;
  primaryGroPump: RoomGroRefillComponent | null = null;
  primaryMicroPump: RoomMicroRefillComponent | null = null;
  primaryBloomPump: RoomBloomRefillComponent | null = null;
  primaryRipenPump: RoomRipenRefillComponent | null = null;
  primaryNutrientPump: RoomNutrientRefillComponent | null = null;
  serialNumber: string;

  constructor(
    serialNumber: string,
    db: DbService,
    api: ApiService,
    settings: SettingsService,
  ) {
    this.db = db;
    this.api = api;
    this.settings = settings;
    this.serialNumber = serialNumber;
  }

  async setup() {
    const room = (await this.db.getItem(
      "rooms",
      this.serialNumber,
      "serialNumber",
    )) as RoomInterface;
    if (!room) return;

    const location = (await this.db.getItem(
      "locations",
      room.locationId,
      "id",
    )) as LocationInterface;
    if (!location) return;

    const probesArr = (await this.db.getItems(
      "probes_list",
      room.locationId,
      "locationId",
    )) as unknown as ProbeInterface[];

    const workersArr = (await this.db.getItems(
      "workers_list",
      room.locationId,
      "locationId",
    )) as unknown as WorkerInterface[];

    for (const el of probesArr) {
        if (el.id) {
            el.schedule = await this.db.getItem("probes_schedule", el.id, "idProbe");
        }
    }
    for (const el of workersArr) {
        if (el.id) {
            el.schedule = await this.db.getItem(
                "workers_schedule",
                el.id,
                "idWorker",
            );
        }
    }

    this.room = room;
    this.location = location;

    await Promise.all(
      probesArr.map(async (probe) => {
        if (probe.id) {
            // probe.type = (await this.db.getItem(
            //     "probes_type",
            //     probe.type,
            //     "id",
            // )) ;

            const schedule: unknown[] = await this.db.getItems(
                "probes_schedule",
                probe.id,
                "idProbe",
            );

            if (room.id) {
                switch (probe.probeType) {
                case ProbesTypes.Air_temperature:
                    probe.component = new TemperatureComponent(
                    room.id,
                    room.name,
                    probe.id,
                    probe.address,
                    schedule,
                    this.db,
                    this.api,
                    this.settings,
                    );
                    await probe.component.setup();
                    break;
                case ProbesTypes.Water_level:
                    probe.component = undefined;
                    // await probe.component.setup();
                    break;
                case ProbesTypes.Water_temperature:
                    probe.component = new TemperatureComponent(
                    room.id,
                    room.name,
                    probe.id,
                    probe.address,
                    schedule,
                    this.db,
                    this.api,
                    this.settings,
                    );
                    await probe.component.setup();
                    break;
                }
            }
        }
      }),
    );

    await Promise.all(
      workersArr.map(async (worker) => {
        if (worker.id) {
            // worker.type = (await this.db.getItem(
            //     "workers_type",
            //     worker.workerType,
            //     "id",
            // )) as WorkerType;

            const schedule: unknown[] = await this.db.getItems(
                "workers_schedule",
                worker.id,
                "idworker",
            );

            if (room.id) {
                switch (worker.workerType) {
                case WorkersTypes.Room_Fan:
                    if (worker.i2cAddress !== null && worker.pin1 !== null) {
                        worker.component = new FanComponent(
                        room.id,
                        room.name,
                        worker.id,
                        worker.i2cAddress,
                        worker.pin1,
                        schedule,
                        this.db,
                        this.api,
                        this.settings,
                        );
                        await worker.component.setup();
                    }
                    break;
                case WorkersTypes.Room_Light:
                    if (worker.i2cAddress !== null && worker.pin1 !== null) {
                        worker.component = new LightSwitchComponent(
                        room.id,
                        room.name,
                        worker.id,
                        worker.i2cAddress,
                        worker.pin1,
                        schedule,
                        this.db,
                        this.api,
                        this.settings,
                        );
                        await worker.component.setup();
                    }
                    break;
                case WorkersTypes.Room_Water_refill:
                    if (worker.i2cAddress !== null && worker.pin1 !== null && worker.pin2 !== null) {
                        worker.component = new RoomWaterRefillComponent(
                        room.id,
                        room.name,
                        worker.id,
                        worker.i2cAddress,
                        worker.pin1,
                        worker.pin2,
                        schedule,
                        this.db,
                        this.api,
                        this.settings,
                        );
                        await worker.component.setup();
                        this.primaryWaterPump =
                        worker.component as RoomWaterRefillComponent;
                    }
                    break;
                case WorkersTypes.Room_PhDown_refill:
                    if (worker.i2cAddress !== null && worker.pin1 !== null && worker.pin2 !== null) {
                        worker.component = new RoomPhDownRefillComponent(
                        room.id,
                        room.name,
                        worker.id,
                        worker.i2cAddress,
                        worker.pin1,
                        worker.pin2,
                        schedule,
                        this.db,
                        this.api,
                        this.settings,
                        );
                        await worker.component.setup();
                        this.primaryPhDownPump =
                        worker.component as RoomPhDownRefillComponent;
                    }
                    break;
                case WorkersTypes.Room_Gro_refill:
                    if (worker.i2cAddress !== null && worker.pin1 !== null && worker.pin2 !== null) {
                        worker.component = new RoomGroRefillComponent(
                        room.id,
                        room.name,
                        worker.id,
                        worker.i2cAddress,
                        worker.pin1,
                        worker.pin2,
                        schedule,
                        this.db,
                        this.api,
                        this.settings,
                        );
                        await worker.component.setup();
                        this.primaryGroPump = worker.component as RoomGroRefillComponent;
                    }
                    break;
                case WorkersTypes.Room_Micro_refill:
                    if (worker.i2cAddress !== null && worker.pin1 !== null && worker.pin2 !== null) {
                        worker.component = new RoomMicroRefillComponent(
                        room.id,
                        room.name,
                        worker.id,
                        worker.i2cAddress,
                        worker.pin1,
                        worker.pin2,
                        schedule,
                        this.db,
                        this.api,
                        this.settings,
                        );
                        await worker.component.setup();
                        this.primaryMicroPump =
                        worker.component as RoomMicroRefillComponent;
                    }
                    break;
                case WorkersTypes.Room_Bloom_refill:
                    if (worker.i2cAddress !== null && worker.pin1 !== null && worker.pin2 !== null) {
                        worker.component = new RoomBloomRefillComponent(
                        room.id,
                        room.name,
                        worker.id,
                        worker.i2cAddress,
                        worker.pin1,
                        worker.pin2,
                        schedule,
                        this.db,
                        this.api,
                        this.settings,
                        );
                        await worker.component.setup();
                        this.primaryBloomPump =
                        worker.component as RoomBloomRefillComponent;
                    }
                    break;
                case WorkersTypes.Room_Ripen_refill:
                    if (worker.i2cAddress !== null && worker.pin1 !== null && worker.pin2 !== null) {
                        worker.component = new RoomRipenRefillComponent(
                        room.id,
                        room.name,
                        worker.id,
                        worker.i2cAddress,
                        worker.pin1,
                        worker.pin2,
                        schedule,
                        this.db,
                        this.api,
                        this.settings,
                        );
                        await worker.component.setup();
                        this.primaryRipenPump =
                        worker.component as RoomRipenRefillComponent;
                    }
                    break;
                // case WorkersTypes.Room_Nutrient_refill:
                //   worker.component = new RoomNutrientRefillComponent(room.id, room.name, worker.id,
                //     this.primaryGroPump,
                //     this.primaryMicroPump,
                //     this.primaryBloomPump,
                //     this.primaryRipenPump,
                //     schedule, this.db, this.api, this.settings)
                //   await worker.component.setup();
                //   this.primaryNutrientPump = worker.component;
                // break;
                }
            }
        }
      }),
    );

    this.probes = probesArr;
    this.workers = workersArr;

    if (!this.room) return;
    const potsLocation = (await this.db.getItems(
      "locations",
      this.room.locationId,
      "parent",
    )) as LocationInterface[];
    await Promise.all(
      potsLocation.map(async (el) => {
        const pot = new PotComponent(
          this.primaryWaterPump,
          this.primaryPhDownPump,
          this.primaryNutrientPump,
          this.db,
          this.api,
          this.settings,
        );
        if (el.id) {
            await pot.setup(el.id);
            this.pots.push(pot);
        }
      }),
    );
  }
}
export default RoomComponent;
