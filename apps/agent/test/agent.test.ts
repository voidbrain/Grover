import type { z } from 'zod';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { AgentConfig, PROTOCOL_VERSION, type Actuator } from '@grover/contracts';
import { Agent } from '../src/agent.ts';
import { MockDrivers } from '../src/drivers/mock.ts';

const mock = { driver: 'mock' as const };
const pump = (id: string, kind: Actuator['kind'], potId: string | null = null): Actuator => ({
  id,
  roomId: 'r',
  potId,
  kind,
  name: id,
  enabled: true,
  binding: mock,
  maxRunMs: 60_000,
  mlPerSecond: 10_000,
});

/** An agent with a cached config and no hub (MQTT to a closed port): enough to drive tick() and execute(). */
async function agentWith(
  // The input shape: fields with defaults (a schedule's days) may be left out, as in configs saved before them.
  config: Omit<z.input<typeof AgentConfig>, 'protocol' | 'agentId' | 'roomId' | 'timezone' | 'issuedAt'>,
  drivers: MockDrivers,
  now: () => number,
) {
  const dir = mkdtempSync(join(tmpdir(), 'grover-agent-'));
  mkdirSync(dir, { recursive: true });
  const full = AgentConfig.parse({
    protocol: PROTOCOL_VERSION,
    agentId: 'pi-1',
    roomId: 'r',
    timezone: 'UTC',
    issuedAt: 1,
    ...config,
  });
  writeFileSync(join(dir, 'config.json'), JSON.stringify(full));
  const agent = new Agent(
    { agentId: 'pi-1', token: 't', hubUrl: 'mqtt://127.0.0.1:9', stateDir: dir, drivers: 'mock', version: 't' },
    drivers,
    now,
  );
  await agent.start();
  return agent;
}

test('scheduled pump runs wait while a feed runs', async () => {
  // 10:01: an odd minute, so the every-2-minutes schedule does not fire at start-up; it fires at 10:02, mid-feed.
  let t = Date.parse('2026-06-01T10:01:00Z');
  const drivers = new MockDrivers();
  const agent = await agentWith(
    {
      mode: 'normal',
      probes: [
        {
          id: 'mix',
          roomId: 'r',
          potId: null,
          kind: 'water_level',
          name: 'mix',
          enabled: true,
          binding: mock,
          tank: 'mix',
          alertBelow: null,
          alertAbove: null,
          calibration: null,
        },
      ],
      actuators: [
        pump('pump-water', 'pump_water'),
        pump('pump-micro', 'pump_micro'),
        pump('pot-1-transfer', 'pump_transfer', 'pot-1'),
      ],
      schedules: [
        {
          id: 's',
          target: { type: 'actuator', actuatorId: 'pump-micro' },
          rule: { kind: 'every', everyMinutes: 2, durationMs: 50 },
          enabled: true,
        },
      ],
    },
    drivers,
    () => t,
  );
  const ack = await agent.execute({
    id: 'c1',
    kind: 'feed',
    plan: {
      feedId: 'f1',
      potId: 'pot-1',
      steps: [{ actuatorId: 'pump-water', tank: 'water', ml: 10, durationMs: 1 }],
      checks: [],
      settleMs: 2_000,
      transfer: {
        actuatorId: 'pot-1-transfer',
        maxMs: 100,
        sliceMs: 50,
        mixProbeId: null,
        mixEmptyLevel: 1,
        potProbeId: null,
        potMaxLevel: null,
      },
    },
  });
  assert.equal(ack.ok, true);
  t += 60_000; // 10:02: the micro pump schedule fires
  await agent.tick();
  await new Promise((r) => setTimeout(r, 120));
  assert.notEqual(drivers.states.get('pump-micro'), true);
  assert.equal(drivers.world.mix.nutrientMl, 0, 'no micro went into the batch');
  await agent.execute({ id: 'c2', kind: 'stop_all', source: 'manual' });
  await agent.stop();
});

test('a window switch that fails is tried again on the next tick', async () => {
  const t = Date.parse('2026-06-01T10:00:00Z');
  const drivers = new MockDrivers();
  let fail = true;
  const real = drivers.actuator.bind(drivers);
  drivers.actuator = async (a) => {
    const d = await real(a);
    return { set: async (on) => (fail && on ? Promise.reject(new Error('relay busy')) : d.set(on)) };
  };
  const agent = await agentWith(
    {
      mode: 'normal',
      probes: [],
      actuators: [{ ...pump('light', 'light'), maxRunMs: 0, mlPerSecond: null }],
      schedules: [
        {
          id: 'w',
          target: { type: 'actuator', actuatorId: 'light' },
          rule: { kind: 'window', from: '06:00', to: '00:00' },
          enabled: true,
        },
      ],
    },
    drivers,
    () => t,
  );
  assert.notEqual(drivers.states.get('light'), true, 'first attempt failed');
  fail = false;
  await agent.tick();
  assert.equal(drivers.states.get('light'), true, 'retried and on');
  await agent.stop();
});

test('a dark rule keeps the light off', async () => {
  const t = Date.parse('2026-06-01T10:00:00Z');
  const drivers = new MockDrivers();
  const agent = await agentWith(
    {
      mode: 'normal',
      probes: [],
      actuators: [{ ...pump('light', 'light'), maxRunMs: 0, mlPerSecond: null }],
      schedules: [
        { id: 'd', target: { type: 'actuator', actuatorId: 'light' }, rule: { kind: 'dark' }, enabled: true },
      ],
    },
    drivers,
    () => t,
  );
  await agent.execute({ id: 'c', kind: 'switch', actuatorId: 'light', on: true, source: 'manual' });
  assert.equal(drivers.states.get('light'), true, 'switched on by hand');
  // Dark is re-asserted on every tick (review of #20): a light switched on by hand goes off again.
  await agent.tick();
  assert.equal(drivers.states.get('light'), false, 'off before the agent stops');
  await agent.stop();
});

test('readings come out calibrated (with temperature compensation); a raw read is the driver value, not stored', async () => {
  const t = Date.parse('2026-06-01T10:01:00Z');
  const drivers = new MockDrivers();
  // The mock pH probe reads the simulated solution; treat that number as "volts" for the test.
  const probe = (id: string, kind: 'ph' | 'water_temperature', calibration: unknown = null) => ({
    id,
    roomId: 'r',
    potId: 'pot-1',
    kind,
    name: id,
    enabled: true,
    binding: mock,
    tank: null,
    alertBelow: null,
    alertAbove: null,
    calibration,
  });
  const agent = await agentWith(
    {
      mode: 'normal',
      probes: [
        probe('temp', 'water_temperature'),
        probe('ph', 'ph', {
          points: [
            { raw: 0, value: 7, tempC: 25, takenOn: '2026-06-01' },
            { raw: 1, value: 6, tempC: 25, takenOn: '2026-06-01' },
          ],
          compensation: 'ph',
          tempProbeId: 'temp',
          calibratedAt: 123,
        }),
      ] as never,
      actuators: [],
      schedules: [],
    },
    drivers,
    () => t,
  );
  const raw = await agent.execute({ id: 'r1', kind: 'read', probeId: 'ph', raw: true });
  const before = agent.state.queued;
  // value = 7 - raw at 25 °C; the water temperature (about 21 °C) scales the distance from 7 by 298.15/(T+273.15).
  await agent.execute({ id: 't', kind: 'read', probeId: 'temp', raw: false });
  const read = await agent.execute({ id: 'r2', kind: 'read', probeId: 'ph', raw: false });
  const temp = (await agent.execute({ id: 't2', kind: 'read', probeId: 'temp', raw: true })).value!;
  const expected = 7 + (7 - raw.value! - 7) * (298.15 / (temp + 273.15));
  assert.ok(Math.abs(read.value! - expected) < 0.05, `calibrated ${read.value} ≈ ${expected}`);
  assert.equal(read.calibratedAt, 123, 'the reading names the calibration it applied');
  assert.equal(raw.calibratedAt, null, 'a raw read applied none');
  assert.equal(agent.state.queued, before + 2, 'the raw reads queued no event; the two normal reads did');
  await agent.stop();
});

test('a schedule limited to weekdays does nothing on a Saturday (F-016)', async () => {
  const saturday = Date.parse('2026-11-28T10:00:00Z');
  const drivers = new MockDrivers();
  const agent = await agentWith(
    {
      mode: 'normal',
      probes: [],
      actuators: [{ ...pump('light', 'light'), maxRunMs: 0, mlPerSecond: null }],
      schedules: [
        {
          id: 'w',
          target: { type: 'actuator', actuatorId: 'light' },
          rule: { kind: 'window', from: '06:00', to: '00:00' },
          enabled: true,
          days: [1, 2, 3, 4, 5],
        },
      ],
    },
    drivers,
    () => saturday,
  );
  await agent.tick();
  assert.notEqual(drivers.states.get('light'), true, 'off on Saturday');
  await agent.stop();
});

// Review of #27: what the tick does on a day a schedule does not run.
const at = (iso: string) => Date.parse(iso);
const lightOnly = { ...pump('light', 'light'), maxRunMs: 0, mlPerSecond: null };

test('a window past midnight holds into the next day, and ends at its time (in the tick)', async () => {
  let t = at('2026-11-27T21:59:00Z'); // Friday
  const drivers = new MockDrivers();
  const agent = await agentWith(
    {
      mode: 'normal',
      probes: [],
      actuators: [lightOnly],
      schedules: [
        {
          id: 'w',
          target: { type: 'actuator', actuatorId: 'light' },
          rule: { kind: 'window', from: '22:00', to: '06:00' },
          enabled: true,
          days: [5],
        },
      ],
    },
    drivers,
    () => t,
  );
  t = at('2026-11-27T22:00:00Z');
  await agent.tick();
  assert.equal(drivers.states.get('light'), true, 'Friday 22:00 on');
  t = at('2026-11-28T03:00:00Z');
  await agent.tick();
  assert.equal(drivers.states.get('light'), true, 'Saturday 03:00 still Friday night');
  t = at('2026-11-28T06:00:00Z');
  await agent.tick();
  assert.equal(drivers.states.get('light'), false, 'Saturday 06:00 off');
  await agent.stop();
});

test('on a day it does not run, a switch turned on by hand holds until that day ends, not for days', async () => {
  let t = at('2026-11-28T12:00:00Z'); // Saturday; the window runs Monday to Friday
  const drivers = new MockDrivers();
  const agent = await agentWith(
    {
      mode: 'normal',
      probes: [],
      actuators: [lightOnly],
      schedules: [
        {
          id: 'w',
          target: { type: 'actuator', actuatorId: 'light' },
          rule: { kind: 'window', from: '06:00', to: '20:00' },
          enabled: true,
          days: [1, 2, 3, 4, 5],
        },
      ],
    },
    drivers,
    () => t,
  );
  await agent.tick();
  await agent.execute({ id: 'c', kind: 'switch', actuatorId: 'light', on: true, source: 'manual' });
  t = at('2026-11-28T18:00:00Z');
  await agent.tick();
  assert.equal(drivers.states.get('light'), true, 'held through Saturday');
  t = at('2026-11-29T00:00:00Z');
  await agent.tick();
  assert.equal(drivers.states.get('light'), false, 'off when Sunday starts');
  await agent.stop();
});

test('on a day it does not run, dark is not held and timed runs do not fire', async () => {
  const t = at('2026-11-28T10:00:00Z'); // Saturday
  const drivers = new MockDrivers();
  const agent = await agentWith(
    {
      mode: 'normal',
      probes: [],
      actuators: [lightOnly, pump('pump-water', 'pump_water')],
      schedules: [
        {
          id: 'd',
          target: { type: 'actuator', actuatorId: 'light' },
          rule: { kind: 'dark' },
          enabled: true,
          days: [1],
        },
        {
          id: 'e',
          target: { type: 'actuator', actuatorId: 'pump-water' },
          rule: { kind: 'every', everyMinutes: 60, durationMs: 1000 },
          enabled: true,
          days: [1],
        },
      ],
    },
    drivers,
    () => t,
  );
  await agent.execute({ id: 'c', kind: 'switch', actuatorId: 'light', on: true, source: 'manual' });
  await agent.tick();
  assert.equal(drivers.states.get('light'), true, 'dark only on Mondays');
  assert.notEqual(drivers.states.get('pump-water'), true, 'no Monday run on a Saturday');
  assert.equal(agent.state.active.includes('pump-water'), false);
  await agent.stop();
});
