export interface TemperatureInterface {
  id: number | string;

  setup: () => object;
  component: {
    setStatus: () => object;
  };
}
