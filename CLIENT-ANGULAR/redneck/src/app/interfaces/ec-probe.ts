export interface EcProbeInterface {
  triggerPin: number;
  echoPin: number;
  component: {
    setup: () => object;
  };

  id: number;
  value: number;
  type: {
    maxWarningValue: number;
    minWarningValue: number;
  }
}
