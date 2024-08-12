export interface WaterLoopInterface {
  dNum: number;
  enPin: number;
  in1Pin: number;
  in2Pin: number;

  status:string ;
  id:number ;

  forward?: () => object;
  setup: () => object;
  setStatus: (a: unknown) => object;
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
