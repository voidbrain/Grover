import { lightWindow, DEFAULT_CALENDAR } from '@grover/contracts';
import type { Store } from './store.ts';

/**
 * A demo tent wired to mock drivers, laid out like the owner's rig (F-011):
 * - tent: light and fan on windows, air temperature;
 * - six supply tanks (water, grow, micro, bloom, ripen, pH down), each with a level probe (low alert) and a pump
 *   into one mixing tank, which has its own level probe;
 * - four pots, each with a transfer pump from the mixing tank, a recirculation pump and a level probe;
 *   pot 1 has its own pH and EC probes, the others use the tent's shared pair.
 * Used by `npm run dev` and the tests.
 */
export function seedDemo(store: Store, agentId = 'pi-1'): void {
  const mock = { driver: 'mock' as const };
  const room = 'grow-1';
  store.tx(() => {
    store.putCalendar(DEFAULT_CALENDAR);
    const start = new Date(Date.now() - 20 * 86_400_000).toISOString().slice(0, 10); // day 20: veg
    store.putRoom({
      id: room,
      name: 'Tent 1',
      agentId,
      mode: 'normal',
      autoFeed: false,
      calendarId: DEFAULT_CALENDAR.id,
      calendarStart: start,
      mixEmptyLevel: 1,
      mixSettleSeconds: 60,
      feedCooldownMinutes: 60,
    });

    const probe = (id: string, kind: string, name: string, extra: Record<string, unknown> = {}) =>
      store.putProbe({ id, roomId: room, potId: null, kind, name, enabled: true, binding: mock, ...extra });
    const pump = (
      id: string,
      kind: string,
      name: string,
      mlPerSecond: number,
      maxRunMs: number,
      potId: string | null = null,
    ) =>
      store.putActuator({ id, roomId: room, potId, kind, name, enabled: true, binding: mock, maxRunMs, mlPerSecond });
    const sw = (id: string, kind: string, name: string, potId: string | null = null) =>
      store.putActuator({
        id,
        roomId: room,
        potId,
        kind,
        name,
        enabled: true,
        binding: mock,
        maxRunMs: 0,
        mlPerSecond: null,
      });

    // Tent
    probe('air-temp', 'air_temperature', 'Air temperature', { alertAbove: 32 });
    sw('light', 'light', 'Light');
    sw('fan', 'fan', 'Fan');
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

    // Supply tanks and their pumps into the mixing tank. Levels in cm.
    const tanks = [
      ['water', 'pump_water', 'Water', 20, 120_000, 5],
      ['grow', 'pump_grow', 'Grow', 1.5, 30_000, 3],
      ['micro', 'pump_micro', 'Micro', 1.5, 30_000, 3],
      ['bloom', 'pump_bloom', 'Bloom', 1.5, 30_000, 3],
      ['ripen', 'pump_ripen', 'Ripen', 1.5, 30_000, 3],
      ['ph_down', 'pump_ph_down', 'pH down', 0.5, 20_000, 2],
    ] as const;
    for (const [role, kind, name, flow, cap, low] of tanks) {
      probe(`tank-${role.replace('_', '-')}`, 'water_level', `${name} tank`, { tank: role, alertBelow: low });
      pump(kind.replace('_', '-'), kind, `${name} pump`, flow, cap);
    }
    probe('tank-mix', 'water_level', 'Mixing tank', { tank: 'mix' });
    // The tent's shared pH/EC pair (pots without their own use it).
    probe('ph', 'ph', 'pH (shared)');
    probe('ec', 'ec', 'EC (shared)');

    // Pots
    for (const n of [1, 2, 3, 4]) {
      const pot = `pot-${n}`;
      store.putPot({ id: pot, roomId: room, name: `Pot ${n}`, liters: 15, feedLiters: 2, litersPerCm: 0.5 });
      store.putProbe({
        id: `${pot}-level`,
        roomId: room,
        potId: pot,
        kind: 'water_level',
        name: `Pot ${n} level`,
        enabled: true,
        binding: mock,
      });
      pump(`${pot}-transfer`, 'pump_transfer', `Pot ${n} feed pump`, 25, 60_000, pot);
      sw(`${pot}-loop`, 'water_loop', `Pot ${n} recirculation`, pot);
      store.putSchedule({
        id: `${pot}-loop-on`,
        target: { type: 'actuator', actuatorId: `${pot}-loop` },
        rule: { kind: 'window', from: '00:00', to: '00:00' },
        enabled: true,
      });
    }
    for (const kind of ['ph', 'ec'] as const)
      store.putProbe({
        id: `pot-1-${kind}`,
        roomId: room,
        potId: 'pot-1',
        kind,
        name: `Pot 1 ${kind === 'ph' ? 'pH' : 'EC'}`,
        enabled: true,
        binding: mock,
      });

    // Readings every 5 minutes for everything.
    for (const p of store.listProbes(room))
      store.putSchedule({
        id: `read-${p.id}`,
        target: { type: 'probe', probeId: p.id },
        rule: { kind: 'every', everyMinutes: 5 },
        enabled: true,
      });
  });
}
