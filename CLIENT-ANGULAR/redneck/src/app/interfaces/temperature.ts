export interface TemperatureInterface {
  id: number;
  locationId: number;
  type: {
    maxWarningValue?: number;
    minWarningValue?: number;
    minAcceptableValue?: number;
    maxAcceptableValue?: number;
    um: string;
  },
  value: number;

  setup: () => object;
  component: {
    setStatus: () => object;
  };
}
