import { ProbesTypes, WorkersTypes } from "../../../../services/settings/enum";

import TemperatureComponent from "../../probes/temperature/temperature";
// import PhProbe from '../../probes/ph/ph';
// import EcProbe from '../../probes/ec/ec';
// import WaterLevel from '../../probes/water-level/water-level';

import WaterLoopComponent from "../../actuators/water-loop/water-loop";
import RefillComponent from "../../actuators/pot-refill/pot-refill";
import RoomWaterRefillComponent from "../../actuators/room-water-refill/room-water-refill";
import RoomPhDownRefillComponent from "../../actuators/room-phdown-refill/room-phdown-refill";
import RoomNutrientRefillComponent from "../../actuators/room-nutrient-refill/room-nutrient-refill";

import { LocationInterface } from "../../../location";
import { PotInterface } from "../../../pot";
import { RoomInterface } from "../../../room";
import { PlantExtended } from "../../../plant";
import { PhaseExtended } from "../../../phase";
import { ProbeInterface } from "../../../probe";
import { WorkerInterface } from "../../../worker";
import { DbService } from "../../../../services/db/db.service";
import { ApiService } from "../../../../services/api/api.service";
import { SettingsService } from "../../../../services/settings/settings.service";
import { PhaseInterface } from "../../../phase";

class PotComponent {
  room: RoomInterface;
  primaryWaterPump: RoomWaterRefillComponent;
  primaryPhDownPump: RoomPhDownRefillComponent;
  primaryNutrientPump: RoomNutrientRefillComponent;
  db;
  api;
  pot: PotInterface | null = null;
  location: LocationInterface | null = null;
  probes: ProbeInterface[] = [];
  workers: WorkerInterface[] = [];
  settings;
  locationId?: number;
  phase: PhaseInterface;

  constructor(
    primaryWaterPump,
    primaryPhDownPump,
    primaryNutrientPump,
    db: DbService,
    api: ApiService,
    settings: SettingsService,
  ) {
    // this.phProbe = new PhProbe(phProbeID);
    // this.ecProbe = new EcProbe(ecProbeID);
    // this.waterLevel = new WaterLevel(waterLevelProbeID, waterLevelProbeTriggerPin, waterLevelProbeEchoPin);
    // this.waterLoop = new WaterLoop(waterLoopID);
    this.primaryWaterPump = primaryWaterPump;
    this.primaryPhDownPump = primaryPhDownPump;
    this.primaryNutrientPump = primaryNutrientPump;
    this.db = db;
    this.api = api;
    this.settings = settings;
  }

  async setup(locationId: number) {
    this.locationId = locationId;
    const pot: PotInterface = (await this.db.getItem(
      "pots",
      locationId,
      "locationId",
    )) as PotInterface;
    const location: LocationInterface = (await this.db.getItem(
      "locations",
      pot.locationId,
      "id",
    )) as LocationInterface;
    const probesArr: ProbeInterface[] = await this.db.getItems(
      "probes_list",
      pot.locationId,
      "locationId",
    ) as ProbeInterface[];
    const workersArr: WorkerInterface[] = await this.db.getItems(
      "workers_list",
      pot.locationId,
      "locationId",
    ) as WorkerInterface[];

    const plant: PlantExtended = await this.db.getItem(
      "plants",
      pot.id,
      "idPot",
    ) as PlantExtended;
    const phases: PhaseExtended[] = await this.db.getItems(
      "calendar_phases",
      plant.idCalendar,
      "idCalendar",
    ) as PhaseExtended[];
    await Promise.all(
      phases.map(async (phase) => {
        const dose = await this.db.getItem(
          "calendar_doses",
          phase.idDose,
          "id",
        );
        phase.dose = dose;
      }),
    );

    const epochDiffGrow: number =
      new Date().getTime() - new Date(plant.dayStartGrow).getTime();
    plant.daysFromGrow = Math.ceil(epochDiffGrow / (1000 * 60 * 60 * 24));
    const epochDiffBloom: number =
      new Date().getTime() - new Date(plant.dayStartBloom).getTime();
    plant.daysFromBloom = plant.dayStartBloom
      ? Math.ceil(epochDiffBloom / (1000 * 60 * 60 * 24))
      : undefined;
    let countingDays = plant.daysFromBloom
      ? +plant.daysFromBloom
      : +plant.daysFromGrow;
    let foundPhase: PhaseExtended | undefined;
    phases.map((phase: PhaseExtended) => {
      if (
        +countingDays > 0 &&
        ((plant.daysFromBloom && phase.isBlooming) ||
          (!plant.daysFromBloom && !phase.isBlooming))
      ) {
        countingDays -= phase.duration;
        foundPhase = phase;
      }
    });
    this.phase = foundPhase;

    /*
    plant.phase.minEC
    plant.phase.maxEC
    plant.phase.minPh
    plant.phase.maxPh
    
    plant.phase.dose.grow
    plant.phase.dose.micro
    plant.phase.dose.bloom
    plant.phase.dose.ripen
    plant.phase.dose.ECdown
    */

    await Promise.all(
      probesArr.map(async (probe: ProbeInterface) => {
        probe.type = await this.db.getItem(
          "probes_type",
          probe.probeType,
          "id",
        );
        // probe.logs = await this.db.getItems('probes_log', probe.id, 'idProbe') as unknown[];
        const schedule: unknown[] = (await this.db.getItems(
          "probes_schedule",
          probe.id,
          "idProbe",
        )) as unknown[];

        switch (probe.probeType) {
          case ProbesTypes.Water_level:
            probe.component = undefined;
            // await probe.component.setup();
            break;
          case ProbesTypes.Water_temperature:
            probe.component = new TemperatureComponent(
              pot.id,
              pot.name,
              probe.id,
              probe.address,
              schedule,
              this.db,
              this.api,
              this.settings,
            );
            probe.component.setup();
            break;
          case ProbesTypes.pH:
            probe.component = undefined;
            // await probe.component.setup();
            break;
          case ProbesTypes.EC:
            probe.component = undefined;
            // await probe.component.setup();
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
        // worker.logs = await this.db.getItems('workers_log', worker.id, 'idworker') as unknown[];

        const schedule: unknown[] = await this.db.getItems(
          "workers_schedule",
          worker.id,
          "idworker",
        );

        switch (worker.workerType) {
          case WorkersTypes.Pot_Water_loop:
            worker.component = new WaterLoopComponent(
              pot.id,
              pot.name,
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
          case WorkersTypes.Pot_refill:
            worker.component = new RefillComponent(
              this.phase,
              this.primaryWaterPump,
              this.primaryPhDownPump,
              this.primaryNutrientPump,
              pot.id,
              pot.name,
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
            break;
        }
      }),
    );

    this.pot = pot;
    this.location = location;
    this.probes = probesArr;
    this.workers = workersArr;
  }
}
export default PotComponent;
