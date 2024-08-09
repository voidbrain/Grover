export interface PhProbeInterface {
  triggerPin: number;
  echoPin: number;

  component: {
    setup: () => object;
  };
}
