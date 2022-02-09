export interface WaterRefillInterface {
  dNum: number;
  enPin: number;
  in1Pin: number;
  in2Pin: number;
}

export interface Device {
  dNum: number,
  en: number,
  in1: number,
  in2: number,
  enGpio: any,
  in1Gpio: any,
  in2Gpio: any,
}
