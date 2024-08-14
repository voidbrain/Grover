export interface WorkerTypeInterface {
    id: number,
    type: string,
    enabled: number,
    deleted: number,
    lastUpdate: number,
    color: string,
    icon: string,
    title: string,
    defaultDuration: number;

    synced?: number;
}

export interface ConstructorWorkerTypeInterface { key: string; value: number; id?: number } 
