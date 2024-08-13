import { TemperatureInterface } from "../interfaces/temperature";
import { WaterLevelInterface } from "./water-level";
import { WaterRefillInterface } from "./water-refill";
import { PhProbeInterface } from "./ph-probe";
import { EcProbeInterface } from "./ec-probe";
import { ProbesTypes } from "../services/settings/enum";

export interface ProbeLogRowInterface {
  executedTime: string;
  action: string;
  value: number;
}

export interface ProbeInterface {
    locationId: number;
    id: number;
    probeType?: ProbesTypes;
    // component?: unknown; // TemperatureComponent | PhProbeComponent | EcProbeComponent;
    // address: string;
    schedule?: unknown[];

    temp?: TemperatureInterface;
    waterLevel?: WaterLevelInterface;
    WaterRefill?: WaterRefillInterface;
    ph?: PhProbeInterface;
    ec?: EcProbeInterface;

    log?: ProbeLogRowInterface[]
  }
  