export interface WorkerScheduleInterface {
    id: number, 
    idWorker: number, 
    enabled: number, 
    deleted: number, 
    duration: number,
    lastUpdate: number, 
    action: string,
    atDay: string,
    atHour: string, 
    atMinute: string,
    operatingMode: number
}

// PH = 5.8 +/- 0.5
