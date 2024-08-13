import { ProbesTypes, WorkersTypes } from "../../../services/settings/enums";

import { LocationInterface } from "../../../interfaces/location";
import { RoomInterface } from "../../../interfaces/room";

import { PotObject } from "../../../interfaces/pot";
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

class RoomComponent {
  db;
  api;
  settings;
  room: RoomInterface | null = null;
  location: LocationInterface | null = null;
  probes: ProbeInterface[] = [];
  workers: WorkerInterface[] = [];
  pots: PotComponent[] = [];
  primaryWaterPump: RoomWaterRefillComponent;
  primaryPhDownPump: RoomPhDownRefillComponent;
  primaryGroPump: RoomGroRefillComponent;
  primaryMicroPump: RoomMicroRefillComponent;
  primaryBloomPump: RoomBloomRefillComponent;
  primaryRipenPump: RoomRipenRefillComponent;
  primaryNutrientPump: RoomNutrientRefillComponent;
  serialNumber: string;

  constructor(serialNumber, db, api, settings) {
    this.db = db;
    this.api = api;
    this.settings = settings;
    this.serialNumber = serialNumber;
  }

  async setup() {
    const room: RoomInterface = await this.db.getItem(
      "rooms",
      this.serialNumber,
      "serialNumber",
    );
    const location: LocationInterface = await this.db.getItem(
      "locations",
      room.locationId,
      "id",
    );
    const probesArr: ProbeInterface[] = await this.db.getItems(
      "probes_list",
      room.locationId,
      "locationId",
    );
    const workersArr: WorkerInterface[] = await this.db.getItems(
      "workers_list",
      room.locationId,
      "locationId",
    );

    probesArr.forEach(async (el) => {
      el.schedule = await this.db.getItem("probes_schedule", el.id, "idProbe");
    });
    workersArr.forEach(async (el) => {
      el.schedule = await this.db.getItem(
        "workers_schedule",
        el.id,
        "idWorker",
      );
    });
    this.room = room;
    this.location = location;

    await Promise.all(
      probesArr.map(async (probe) => {
        probe.type = await this.db.getItem(
          "probes_type",
          probe.probeType,
          "id",
        );

        const schedule: unknown[] = await this.db.getItems(
          "probes_schedule",
          probe.id,
          "idProbe",
        );

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
      }),
    );

    await Promise.all(
      workersArr.map(async (worker) => {
        worker.type = await this.db.getItem(
          "workers_type",
          worker.workerType,
          "id",
        );

        const schedule: unknown[] = await this.db.getItems(
          "workers_schedule",
          worker.id,
          "idworker",
        );
        switch (worker.workerType) {
          case WorkersTypes.Room_Fan:
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
            break;
          case WorkersTypes.Room_Light:
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
            break;
          case WorkersTypes.Room_Water_refill:
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
            break;
          case WorkersTypes.Room_PhDown_refill:
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
            break;
          case WorkersTypes.Room_Gro_refill:
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
            break;
          case WorkersTypes.Room_Micro_refill:
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
            break;
          case WorkersTypes.Room_Bloom_refill:
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
            break;
          case WorkersTypes.Room_Ripen_refill:
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
      }),
    );

    this.probes = probesArr;
    this.workers = workersArr;

    const potsLocation: LocationInterface[] = (await this.db.getItems(
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
        await pot.setup(el.id);
        this.pots.push(pot);
      }),
    );
  }
}
export default RoomComponent;
