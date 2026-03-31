import { ProbesTypes, WorkersTypes } from "../../../services/settings/enums.ts";
import TemperatureComponent from "../../probes/temperature/temperature";
// import PhProbe from '../../probes/ph/ph';
// import EcProbe from '../../probes/ec/ec';
// import WaterLevel from '../../probes/water-level/water-level';
import WaterLoopComponent from "../../actuators/water-loop/water-loop";
import RefillComponent from "../../actuators/pot-refill/pot-refill";
class PotComponent {
    constructor(primaryWaterPump, primaryPhDownPump, primaryNutrientPump, db, api, settings) {
        this.pot = null;
        this.location = null;
        this.probes = [];
        this.workers = [];
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
    async setup(locationId) {
        this.locationId = locationId;
        const pot = await this.db.getItem("pots", locationId, "locationId");
        const location = (await this.db.getItem("locations", pot.locationId, "id"));
        const probesArr = await this.db.getItems("probes_list", pot.locationId, "locationId");
        const workersArr = await this.db.getItems("workers_list", pot.locationId, "locationId");
        const plant = await this.db.getItem("plants", pot.id, "idPot");
        console.log("[POT]: ", locationId, pot.id, plant);
        const phases = await this.db.getItems("calendar_phases", plant?.idCalendar, "idCalendar");
        await Promise.all(phases.map(async (phase) => {
            const dose = await this.db.getItem("calendar_doses", phase.idDose, "id");
            phase.dose = dose;
        }));
        if (plant) {
            const epochDiffGrow = new Date().getTime() - new Date(plant?.dayStartGrow).getTime();
            plant.daysFromGrow = Math.ceil(epochDiffGrow / (1000 * 60 * 60 * 24));
            const epochDiffBloom = new Date().getTime() - new Date(plant?.dayStartBloom).getTime();
            plant.daysFromBloom = plant?.dayStartBloom
                ? Math.ceil(epochDiffBloom / (1000 * 60 * 60 * 24))
                : undefined;
            let countingDays = plant.daysFromBloom
                ? +plant?.daysFromBloom
                : +plant?.daysFromGrow;
            let foundPhase;
            phases.map((phase) => {
                if (+countingDays > 0 &&
                    ((plant?.daysFromBloom && phase.isBlooming) ||
                        (!plant.daysFromBloom && !phase.isBlooming))) {
                    countingDays -= phase.duration;
                    foundPhase = phase;
                }
            });
            this.phase = foundPhase;
        }
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
        await Promise.all(probesArr.map(async (probe) => {
            probe.type = await this.db.getItem("probes_type", probe.probeType, "id");
            // probe.logs = await this.db.getItems('probes_log', probe.id, 'idProbe') as unknown[];
            const schedule = (await this.db.getItems("probes_schedule", probe.id, "idProbe"));
            switch (probe.probeType) {
                case ProbesTypes.Water_level:
                    probe.component = undefined;
                    // await probe.component.setup();
                    break;
                case ProbesTypes.Water_temperature:
                    probe.component = new TemperatureComponent(pot.id, pot.name, probe.id, probe.address, schedule, this.db, this.api, this.settings);
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
        }));
        await Promise.all(workersArr.map(async (worker) => {
            worker.type = await this.db.getItem("workers_type", worker.workerType, "id");
            // worker.logs = await this.db.getItems('workers_log', worker.id, 'idworker') as unknown[];
            const schedule = await this.db.getItems("workers_schedule", worker.id, "idworker");
            switch (worker.workerType) {
                case WorkersTypes.Pot_Water_loop:
                    worker.component = new WaterLoopComponent(pot.id, pot.name, worker.id, worker.i2cAddress, worker.pin1, schedule, this.db, this.api, this.settings);
                    await worker.component.setup();
                    break;
                case WorkersTypes.Pot_refill:
                    worker.component = new RefillComponent(this.phase, this.primaryWaterPump, this.primaryPhDownPump, this.primaryNutrientPump, pot.id, pot.name, worker.id, worker.i2cAddress, worker.pin1, worker.pin2, schedule, this.db, this.api, this.settings);
                    await worker.component.setup();
                    break;
            }
        }));
        this.pot = pot;
        this.location = location;
        this.probes = probesArr;
        this.workers = workersArr;
    }
}
export default PotComponent;
