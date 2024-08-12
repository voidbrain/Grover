export interface LightSwitchInterface {
  id: number;

  setup: () => object;
  setStatus: (a: unknown) => object;
}
