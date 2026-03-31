import TemperatureComponent from "../hw-components/probes/temperature/temperature";
import PhProbeComponent from "../hw-components/probes/ph/ph";
import EcProbeComponent from "../hw-components/probes/ec/ec";

export interface ProbeInterface {
  id: number;
  type?: string;
  probeType?: number;
  component?: TemperatureComponent | PhProbeComponent | EcProbeComponent;
  address: string;
  schedule?: object;
}
