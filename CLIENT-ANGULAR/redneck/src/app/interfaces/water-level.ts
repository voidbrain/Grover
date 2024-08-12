export interface WaterLevelInterface {
  triggerPin: number;
  echoPin: number;

  id: number;
  value: number;
  type: {
    maxWarningValue: number;
    minWarningValue: number;
  }
}
