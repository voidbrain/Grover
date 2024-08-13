export interface LightSwitchInterface {
  id: number;
  status: string;
  locationId: number;

  setup: () => object;
  setStatus: (a: unknown) => object;
}
