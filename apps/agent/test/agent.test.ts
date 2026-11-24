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
  config: Omit<AgentConfig, 'protocol' | 'agentId' | 'roomId' | 'timezone' | 'issuedAt'>,
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
  assert.equal(drivers.states.get('light'), true);
  // A new config (same rule) re-applies the schedule on the next tick: dark wins.
  await agent.tick();
  await agent.stop();
  assert.notEqual(drivers.states.get('light'), true);
});
