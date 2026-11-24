import { Actuator, Probe, Room, Schedule } from '@grover/contracts';
import {
  actuatorDraft,
  actuatorWiring,
  describeRule,
  parseI2cAddress,
  probeDraft,
  probeWiring,
  roomDraft,
  scheduleDraft,
  slugify,
  toActuator,
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
      },
      {
        id: 'b',
        roomId: 'r',
        potId: 'p1',
        kind: 'ph',
        name: 'B',
        enabled: false,
        binding: { driver: 'ads1115', i2cBus: 1, i2cAddress: 0x48, channel: 2 },
      },
      { id: 'c', roomId: 'r', potId: null, kind: 'ec', name: 'C', enabled: true, binding: { driver: 'mock' } },
    ];
    for (const p of probes) expect(Probe.parse(toProbe(probeDraft(p), 'r'))).toEqual(p);
    expect(probeWiring(probes[1]!.binding)).toBe('ADS1115 0x48 ch 2');
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
      autoDose: true,
      reservoirLiters: 25,
      calendarId: 'default',
      calendarStart: '2026-11-01',
    };
    expect(Room.parse(toRoom(roomDraft(room)))).toEqual(room);
    const bare = toRoom({ ...roomDraft(room), agentId: '', calendarId: '' });
    expect(bare.agentId).toBeNull();
    expect(bare.calendarStart).toBeNull();
  });
});
