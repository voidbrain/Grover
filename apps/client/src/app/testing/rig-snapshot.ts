/** A small tent for client specs: what the hub's snapshot would hold (F-015). */
export const now = Date.now();
const probe = (id: string, kind: string, extra: object = {}) => ({
  id,
  roomId: 'grow-1',
  potId: null,
  kind,
  name: id,
  enabled: true,
  binding: { driver: 'mock' },
  tank: null,
  alertBelow: null,
  alertAbove: null,
  calibration: null,
  ...extra,
});
export const actuator = (id: string, kind: string, extra: object = {}) => ({
  id,
  roomId: 'grow-1',
  potId: null,
  kind,
  name: id,
  enabled: true,
  binding: { driver: 'mock' },
  maxRunMs: 30_000,
  mlPerSecond: null,
  ...extra,
});
const units = { unit: '', min: 0, max: 100, title: '' };

export const snapshot = {
  rooms: [
    {
      id: 'grow-1',
      name: 'Tent',
      mode: 'normal',
      agentId: 'pi-1',
      phase: null,
      autoFeed: false,
      tankColours: { grow: '#1a7f37' },
    },
  ],
  agents: [{ agentId: 'pi-1', roomId: 'grow-1', online: true, lastSeen: now, status: null, configCurrent: true }],
  pots: [{ id: 'pot-1', roomId: 'grow-1', name: 'Pot 1', liters: 15, feedLiters: 2, litersPerCm: 0.5 }],
  probes: [
    probe('tank-grow', 'water_level', { tank: 'grow', alertBelow: 3 }),
    probe('tank-mix', 'water_level', { tank: 'mix' }),
    probe('pot-1-level', 'water_level', { potId: 'pot-1' }),
    probe('ph', 'ph', { name: 'pH (Shared)' }),
  ],
  actuators: [
    actuator('light', 'light', { maxRunMs: 0 }),
    actuator('pump-grow', 'pump_grow'),
    actuator('pot-1-feed', 'pump_transfer', { potId: 'pot-1' }),
    actuator('pot-1-loop', 'water_loop', { potId: 'pot-1', maxRunMs: 0 }),
  ],
  latest: [
    { probeId: 'tank-grow', value: 2, at: now },
    { probeId: 'pot-1-level', value: 20, at: now },
  ],
  alerts: [{ key: 'feed:pot-1', roomId: 'grow-1', potId: 'pot-1', level: 'bad', message: 'feed stopped', since: now }],
  feeds: [],
  potPhases: {},
  plants: [{ id: 'nl', name: 'NL g2', potId: 'pot-1', harvestedOn: null }],
  strains: [],
  breeders: [],
  probeKinds: {
    water_level: { ...units, unit: 'cm' },
    ph: { ...units, unit: 'pH' },
    ec: units,
    water_temperature: units,
    air_temperature: units,
  },
};
