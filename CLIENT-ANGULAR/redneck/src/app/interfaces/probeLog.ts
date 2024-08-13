export interface ProbeLogInterface {
    id?: number,
    idProbe?: number,
    expectedTime?: number,
    executedTime?: number,
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
}

// PH = 5.8 +/- 0.5
