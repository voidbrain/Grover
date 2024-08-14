export interface ProbeTypeInterface {
    color: string;
    deleted: number;
    enabled: number;
    icon: string;
    id: number;
    lastUpdate: number;
    maxAcceptableValue: number;
    minAcceptableValue: number;
    title: string;
    type: string;
    um: string;
    maxWarningValue?: number,
    minWarningValue?: number;

    synced?: number;
}

export interface ConstructorProbeTypeInterface { key: string; value: number; id?: number } 
