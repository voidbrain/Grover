export interface RoomSettingsInterface {
  id: number,
  enabled: number,
  deleted: number,
  lastUpdate: number,
  address: string,
  port: number,
  device: string,
  operatingMode: number

  synced?: number;
}
