export interface EcProbeInterface {
  triggerPin: number;
  echoPin: number;
  component: {
    setup: () => object;
  }
}
