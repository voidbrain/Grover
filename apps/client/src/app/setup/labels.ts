import type { ActuatorKindId, ProbeKindId } from '@grover/contracts/kinds';
import { ACTUATOR_KIND_IDS, PROBE_KIND_IDS, PROBE_KINDS, isPump } from '@grover/contracts/kinds';

export const ACTUATOR_LABELS: Record<ActuatorKindId, string> = {
  light: 'Light',
  fan: 'Fan',
  water_loop: 'Water loop',
  pump_water: 'Water pump',
  pump_ph_down: 'pH-down pump',
  pump_grow: 'Grow nutrient pump',
  pump_micro: 'Micro nutrient pump',
  pump_bloom: 'Bloom nutrient pump',
  pump_ripen: 'Ripen nutrient pump',
  pump_transfer: 'Transfer pump',
};

export const actuatorKinds = ACTUATOR_KIND_IDS.map((id) => ({ id, label: ACTUATOR_LABELS[id], pump: isPump(id) }));
export const probeKinds = PROBE_KIND_IDS.map((id: ProbeKindId) => ({
  id,
  label: PROBE_KINDS[id].title,
  unit: PROBE_KINDS[id].unit,
}));

export const PROBE_DRIVERS = [
  { id: 'mock', label: 'Simulated' },
  { id: 'ds18b20', label: 'DS18B20 (1-Wire temperature)' },
  { id: 'ads1115', label: 'ADS1115 (analog over I²C)' },
  { id: 'hcsr04', label: 'HC-SR04 (not supported on the Pi)' },
] as const;

export const ACTUATOR_DRIVERS = [
  { id: 'mock', label: 'Simulated' },
  { id: 'gpio', label: 'GPIO pin' },
  { id: 'mcp23017', label: 'MCP23017 expander pin' },
] as const;
