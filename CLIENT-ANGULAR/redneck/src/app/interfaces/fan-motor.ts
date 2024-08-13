export interface FanMotorInterface {
  id?: number | string;
  status: string;

  setup: () => object;
  setStatus: (a: unknown) => object;
}
