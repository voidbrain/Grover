import { TemperatureInterface } from "../interfaces/temperature";
import { WaterLevelInterface } from "./water-level";
import { WaterRefillInterface } from "./water-refill";
import { PhProbeInterface } from "./ph-probe";
import { EcProbeInterface } from "./ec-probe";

export interface ProbeInterface {
    // id: number | string;
    type?: string;
    probeType?: number;
    // component?: unknown; // TemperatureComponent | PhProbeComponent | EcProbeComponent;
    // address: string;
    schedule?: object;

    temp?: TemperatureInterface;
    waterLevel?: WaterLevelInterface;
    WaterRefill?: WaterRefillInterface;
    ph?: PhProbeInterface;
    ec?: EcProbeInterface;
  }
  