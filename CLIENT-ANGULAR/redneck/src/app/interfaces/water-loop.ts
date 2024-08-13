import { WorkerInterface } from "./worker";

export interface WaterLoopInterface extends WorkerInterface {
  forward?: () => object;
  setup: () => object;
  setStatus: (a: unknown) => object;
}