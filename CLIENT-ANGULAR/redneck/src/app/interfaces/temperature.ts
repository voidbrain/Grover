export interface TemperatureInterface {
  id: number;
  type: {
    maxWarningValue?: number;
    minWarningValue?: number;
  },
  value: number;

  setup: () => object;
  component: {
    setStatus: () => object;
  };
}
