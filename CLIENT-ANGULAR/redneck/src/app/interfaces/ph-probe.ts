export interface PhProbeInterface {
  triggerPin: number;
  echoPin: number;

  id: number;
  value: number;
  type: {
    maxWarningValue: number;
    minWarningValue: number;
  }

  component: {
    setup: () => object;
  };
}
