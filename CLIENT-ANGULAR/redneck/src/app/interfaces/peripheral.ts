export interface PeripheralInterface {
    element: string;
    title?: string;
    scheduleType: number;
    color: string;
    icon: string;
    atDay: string;
    atMinute: string;
    operatingMode: string;
    hourValues: [from: number, to: number];
    cron: ScheduleRow;
    key?: string;
}

export interface ScheduleRow {
    atMinute: string;
    atHour: string;
    atDay: string;
    operatingMode: string;
    from?: number;
    to?: number;
  }