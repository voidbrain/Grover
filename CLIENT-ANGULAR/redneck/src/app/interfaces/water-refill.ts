export interface WaterRefillInterface {
  id: number;
  dNum: number;
  enPin: number;
  in1Pin: number;
  in2Pin: number;
  locationId: number;

  forward?: () => object;
  setup: () => object;
  setStatus: (a: undefined) => object;
}

export interface DeviceInterface {
  dNum: number;
  en: number;
  in1: number;
  in2: number;
  enGpio: number;
  in1Gpio: number;
  in2Gpio: number;
}
