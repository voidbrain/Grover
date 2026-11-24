import type { Actuator, Probe } from '@grover/contracts';

export interface ProbeDriver {
  read(): Promise<number>;
  close?(): Promise<void>;
}

export interface ActuatorDriver {
  /** Must be safe to call repeatedly and must never throw past a best effort. */
  set(on: boolean): Promise<void>;
  close?(): Promise<void>;
}

export interface DriverFactory {
  probe(probe: Probe): Promise<ProbeDriver>;
  actuator(actuator: Actuator): Promise<ActuatorDriver>;
  close(): Promise<void>;
}
