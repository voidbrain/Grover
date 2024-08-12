import { TemperatureInterface } from "../interfaces/temperature";
import { WaterLevelInterface } from "./water-level";
import { WaterRefillInterface } from "./water-refill";
import { PhProbeInterface } from "./ph-probe";
import { EcProbeInterface } from "./ec-probe";

export interface LogRow {
  executedTime: string;
  action: string;
  value: number;
}

export interface ProbeInterface {
    locationId: number;
    id: number;
    type?: { minAcceptableValue: number; maxAcceptableValue: number };
    probeType?: number;
    // component?: unknown; // TemperatureComponent | PhProbeComponent | EcProbeComponent;
    // address: string;
    schedule?: unknown[];

    temp?: TemperatureInterface;
    waterLevel?: WaterLevelInterface;
    WaterRefill?: WaterRefillInterface;
    ph?: PhProbeInterface;
    ec?: EcProbeInterface;

    log?: LogRow[]
  }
  