export interface WaterRefillInterface {
  dNum: number;
  enPin: number;
  in1Pin: number;
  in2Pin: number;

  forward?: () => object;
  setup: () => object;
  setStatus: (a) => object;
}

export interface Device {
  dNum: number;
  en: number;
  in1: number;
  in2: number;
  enGpio: number;
  in1Gpio: number;
  in2Gpio: number;
}
