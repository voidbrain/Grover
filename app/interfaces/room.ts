export interface RoomInterface {
  id: number;
  type?: string;
  name: string;
  isBlooming: boolean;
  deviceSerial: string;
  waterTemperatureProbeID: string;
  
  waterRefillDNum: number;
  waterRefillEnPin: number;
  waterRefillIn1Pin: number;
  waterRefillIn2Pin: number; 
  
  waterTemperatureProbeSchedule: string;

  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
  
}
