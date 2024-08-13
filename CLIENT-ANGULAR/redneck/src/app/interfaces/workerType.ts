export interface WorkerTypeInterface {
    id: number,
    type: string,
    enabled: number,
    deleted: number,
    lastUpdate: number,
    color: string,
    icon: string,
    title: string,
    defaultDuration: number
}

export interface ConstructorWorkerTypeInterface { key: string; value: number } 
