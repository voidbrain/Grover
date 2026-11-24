import { lightWindow, DEFAULT_CALENDAR } from '@grover/contracts';
import type { Store } from './store.ts';

/**
 * A demo room wired to mock drivers: one reservoir, four pots, the probes and pumps of the original
 * Grover build. Used by `npm run dev` and the tests. Swap bindings for real ones on the Pi.
 */
export function seedDemo(store: Store, agentId = 'pi-1'): void {
  const mock = { driver: 'mock' as const };
  store.tx(() => {
    store.putCalendar(DEFAULT_CALENDAR);
    const start = new Date(Date.now() - 20 * 86_400_000).toISOString().slice(0, 10); // day 20: veg
    store.putRoom({
      id: 'grow-1',
      name: 'Grow room',
      agentId,
      mode: 'normal',
      autoDose: false,
      reservoirLiters: 20,
      calendarId: DEFAULT_CALENDAR.id,
      calendarStart: start,
    });
    for (const n of [1, 2, 3, 4]) store.putPot({ id: `pot-${n}`, roomId: 'grow-1', name: `Pot ${n}` });

    const probes = [
      ['air-temp', 'air_temperature', 'Air temperature'],
      ['water-temp', 'water_temperature', 'Reservoir temperature'],
      ['level', 'water_level', 'Reservoir level'],
      ['ph', 'ph', 'Reservoir pH'],
      ['ec', 'ec', 'Reservoir EC'],
    ] as const;
    for (const [id, kind, name] of probes)
      store.putProbe({ id, roomId: 'grow-1', potId: null, kind, name, enabled: true, binding: mock });

    const pump = (id: string, kind: string, name: string) =>
      store.putActuator({
        id,
        roomId: 'grow-1',
        potId: null,
        kind,
        name,
        enabled: true,
        binding: mock,
        maxRunMs: 30_000,
        mlPerSecond: 1.5,
      });
    pump('pump-grow', 'pump_grow', 'Grow');
    pump('pump-micro', 'pump_micro', 'Micro');
    pump('pump-bloom', 'pump_bloom', 'Bloom');
    pump('pump-ripen', 'pump_ripen', 'Ripen');
    pump('pump-ph-down', 'pump_ph_down', 'pH down');
    store.putActuator({
      id: 'pump-water',
      roomId: 'grow-1',
      potId: null,
      kind: 'pump_water',
      name: 'Water',
      enabled: true,
      binding: mock,
      maxRunMs: 120_000,
      mlPerSecond: 20,
    });
    store.putActuator({
      id: 'light',
      roomId: 'grow-1',
      potId: null,
      kind: 'light',
      name: 'Light',
      enabled: true,
      binding: mock,
      maxRunMs: 0,
      mlPerSecond: null,
    });
    store.putActuator({
      id: 'fan',
      roomId: 'grow-1',
      potId: null,
      kind: 'fan',
      name: 'Fan',
      enabled: true,
      binding: mock,
      maxRunMs: 0,
      mlPerSecond: null,
    });

    store.putSchedule({
      id: 'light-veg',
      target: { type: 'actuator', actuatorId: 'light' },
      rule: lightWindow(18),
      enabled: true,
    });
    store.putSchedule({
      id: 'fan-day',
      target: { type: 'actuator', actuatorId: 'fan' },
      rule: { kind: 'window', from: '06:00', to: '00:00' },
      enabled: true,
    });
    for (const [id] of probes)
      store.putSchedule({
        id: `read-${id}`,
        target: { type: 'probe', probeId: id },
        rule: { kind: 'every', everyMinutes: 5 },
        enabled: true,
      });
  });
}
