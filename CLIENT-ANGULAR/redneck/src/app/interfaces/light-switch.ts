export interface LightSwitchInterface {
  id: number;
  status: string;

  setup: () => object;
  setStatus: (a: unknown) => object;
}
