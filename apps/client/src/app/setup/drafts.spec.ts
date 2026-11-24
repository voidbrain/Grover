import { Actuator, Pot, Probe, Room, Schedule } from '@grover/contracts';
import {
  actuatorDraft,
  actuatorWiring,
  describeRule,
  parseI2cAddress,
  potDraft,
  probeDraft,
  probeWiring,
  roomDraft,
  scheduleDraft,
  slugify,
  toActuator,
  toPot,
  toProbe,
  toRoom,
  toSchedule,
  uniqueId,
} from './drafts';

describe('setup drafts', () => {
  it('makes ids from names and keeps them unique', () => {
    expect(slugify('Grow pump #2')).toBe('grow-pump-2');
    expect(slugify('  Pièce à vivre  ')).toBe('piece-a-vivre');
    expect(uniqueId('pot', ['pot', 'pot-2'])).toBe('pot-3');
    expect(uniqueId('', [])).toBe('item');
  });

  it('reads I²C addresses in hex or decimal', () => {
    expect(parseI2cAddress('0x20')).toBe(32);
    expect(parseI2cAddress('72')).toBe(72);
    expect(parseI2cAddress('0xzz')).toBeNaN();
  });

  it('round-trips every probe binding through a draft', () => {
    const probes: Probe[] = [
      {
        id: 'a',
        roomId: 'r',
        potId: null,
        kind: 'water_temperature',
        name: 'A',
        enabled: true,
        binding: { driver: 'ds18b20', address: '28-01' },
        tank: null,
        alertBelow: null,
        alertAbove: 30,
      },
      {
        id: 'b',
        roomId: 'r',
        potId: 'p1',
        kind: 'ph',
        name: 'B',
        enabled: false,
        binding: { driver: 'ads1115', i2cBus: 1, i2cAddress: 0x48, channel: 2 },
        tank: null,
        alertBelow: null,
        alertAbove: null,
      },
      {
        id: 'c',
        roomId: 'r',
        potId: null,
        kind: 'water_level',
        name: 'Grow tank',
        enabled: true,
        binding: { driver: 'mock' },
        tank: 'grow',
        alertBelow: 3,
        alertAbove: null,
      },
    ];
    for (const p of probes) expect(Probe.parse(toProbe(probeDraft(p), 'r'))).toEqual(p);
    expect(probeWiring(probes[1]!.binding)).toBe('ADS1115 0x48 ch 2');
  });

  it('keeps tanks off pots and reads optional alert numbers', () => {
    const d = {
      ...probeDraft(),
      id: 'x',
      name: 'Water tank',
      kind: 'water_level' as const,
      potId: 'pot-1',
      tank: 'water' as const,
      alertBelow: ' 5 ',
      alertAbove: '',
    };
    const p = toProbe(d, 'r');
    expect(p.potId).toBeNull();
    expect(p.alertBelow).toBe(5);
    expect(p.alertAbove).toBeNull();
    expect(toProbe({ ...d, kind: 'ph' }, 'r').tank).toBeNull();
    expect(Probe.safeParse(toProbe({ ...d, alertBelow: 'lots' }, 'r')).success).toBe(false);
  });

  it('round-trips pots; 0 litres per cm means unknown', () => {
    const pot: Pot = { id: 'p', roomId: 'r', name: 'Pot', liters: 15, feedLiters: 2, litersPerCm: 0.5 };
    expect(Pot.parse(toPot(potDraft(pot), 'r'))).toEqual(pot);
    expect(toPot({ ...potDraft(pot), litersPerCm: 0 }, 'r').litersPerCm).toBeNull();
  });

  it('round-trips pumps and switches, dropping pump-only values on switches', () => {
    const pump: Actuator = {
      id: 'g',
      roomId: 'r',
      potId: null,
      kind: 'pump_grow',
      name: 'Grow',
      enabled: true,
      binding: { driver: 'mcp23017', i2cBus: 1, i2cAddress: 0x20, pin: 3, activeLow: false },
      maxRunMs: 30_000,
      mlPerSecond: 1.5,
    };
    expect(Actuator.parse(toActuator(actuatorDraft(pump), 'r', true))).toEqual(pump);
    expect(actuatorWiring(pump.binding)).toBe('MCP23017 0x20 pin 3');

    const light = toActuator(
      { ...actuatorDraft(), kind: 'light', name: 'Light', id: 'l', driver: 'gpio', pin: 17, mlPerSecond: 2 },
      'r',
      false,
    );
    expect(light.maxRunMs).toBe(0);
    expect(light.mlPerSecond).toBeNull();
    expect(light.binding).toEqual({ driver: 'gpio', pin: 17, activeLow: false });

    const uncalibrated = toActuator({ ...actuatorDraft(pump), mlPerSecond: 0 }, 'r', true);
    expect(uncalibrated.mlPerSecond).toBeNull();
  });

  it('round-trips schedules and reads a list of times', () => {
    const schedules: Schedule[] = [
      {
        id: 'w',
        target: { type: 'actuator', actuatorId: 'light' },
        rule: { kind: 'window', from: '06:00', to: '00:00' },
        enabled: true,
      },
      {
        id: 'a',
        target: { type: 'actuator', actuatorId: 'pump' },
        rule: { kind: 'at', times: ['08:00', '20:00'], durationMs: 2000 },
        enabled: true,
      },
      {
        id: 'e',
        target: { type: 'probe', probeId: 'ph' },
        rule: { kind: 'every', everyMinutes: 5, durationMs: 0 },
        enabled: false,
      },
    ];
    for (const s of schedules) expect(Schedule.parse(toSchedule(scheduleDraft(s)))).toEqual(s);
    const dark: Schedule = {
      id: 'd',
      target: { type: 'actuator', actuatorId: 'light' },
      rule: { kind: 'dark' },
      enabled: true,
    };
    expect(Schedule.parse(toSchedule(scheduleDraft(dark)))).toEqual(dark);
    expect(toSchedule({ ...scheduleDraft(schedules[1]), times: '07:00,19:30  21:00' }).rule).toEqual({
      kind: 'at',
      times: ['07:00', '19:30', '21:00'],
      durationMs: 2000,
    });
    expect(describeRule(schedules[1]!.rule)).toBe('at 08:00, 20:00 for 2 s');
  });

  it('round-trips rooms; no calendar means no start date', () => {
    const room: Room = {
      id: 'r',
      name: 'Room',
      agentId: 'pi-1',
      mode: 'silent',
      autoFeed: true,
      mixEmptyLevel: 1.5,
      mixSettleSeconds: 30,
      feedCooldownMinutes: 90,
      waterEc: 0.25,
      waterPh: 7.2,
      lightFrom: 'calendar',
      lightStart: '07:00',
      lightPlantId: 'p1',
      calendarId: 'default',
      calendarStart: '2026-11-01',
    };
    expect(Room.parse(toRoom(roomDraft(room)))).toEqual(room);
    const bare = toRoom({ ...roomDraft(room), agentId: '', calendarId: '' });
    expect(bare.agentId).toBeNull();
    expect(bare.calendarStart).toBeNull();
  });
});
