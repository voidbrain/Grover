import { EcProbeInterface } from "./ec-probe";
import { PhProbeInterface } from "./ph-probe";
import { TemperatureInterface } from "./temperature";

export interface ProbeInterface {
  id: number | string;
  type?: string;
  probeType?: number;
  component?: TemperatureInterface | PhProbeInterface | EcProbeInterface;
  address: string;
  schedule?: object;
}
