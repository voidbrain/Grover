export interface WorkerLogInterface {
    id?: number,
    idWorker?: number,
    expectedTime?: string,
    executedTime?: string,
    operatingMode: number,
    systemOperatingMode: number,
    serialNumber: string,
    action: string,
    ipAddress: string,
    parentId: number,
    parentName: string,
    lastUpdate: number,
    owner: string,
    type: number,
    duration?: number;
    deleted?: number;
    synced?: number;
}

// PH = 5.8 +/- 0.5
