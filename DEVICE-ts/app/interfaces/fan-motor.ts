export interface FanMotorInterface {
  id?: number | string;

  setup: () => object;
  setStatus: (a) => object;
}
