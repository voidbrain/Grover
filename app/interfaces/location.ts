export interface LocationInterface {
  id: number;
  type?: string;
  name: string;
  isBlooming: boolean;
  // deviceId?: string;

  waterTemperatureProbeID: string;
  waterRefillDNum: number;
  waterRefillEnPin: number;
  waterRefillIn1Pin: number;
  waterRefillIn2Pin: number;
  waterTemperatureProbeSchedule: string;

  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
  idParent: number;
}
