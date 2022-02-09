import LocationComponent  from '../hw-components/environment/location/location';

export interface RoomInterface {
  id: string,
  waterTemperatureProbeID: string,
  waterRefillDNum: number,
  waterRefillEnPin: number,
  waterRefillIn1Pin: number,
  waterRefillIn2Pin: number, 
  
  locations: LocationComponent[];
}
