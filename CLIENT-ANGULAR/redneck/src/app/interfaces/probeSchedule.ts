export interface ProbeScheduleInterface {
    id: number, 
    idProbe: number, 
    enabled: number, 
    deleted: number, 
    lastUpdate: number, 
    action: string,
    atDay: string,
    atHour: string, 
    atMinute: string,
    operatingMode: number
}