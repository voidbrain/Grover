export interface FanMotorInterface {
  id?: number | string;
  status: string;
  locationId: number;

  setup: () => object;
  setStatus: (a: unknown) => object;
}
