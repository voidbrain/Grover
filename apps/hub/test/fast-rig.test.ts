import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MockWorld } from '../../agent/src/drivers/mock.ts';
import { Alerts } from '../src/alerts.ts';
import { openDb } from '../src/db.ts';
import { Bus } from '../src/events.ts';
import { Feeder } from '../src/feeder.ts';
import { seedDemo } from '../src/seed.ts';
import { Store } from '../src/store.ts';
import { speedUpRig } from './fast-rig.ts';

/**
 * B-008: the simulated pumps deliver for as long as they are really on, and a busy runner switches them off late.
 * With the e2e test run ten at a time under CPU load, a feed's five water runs of 20 ms delivered up to 4.7 L more
 * than planned: about 50 ms late per run. On the sped-up rig that lateness must not add more liquid than the
 * transfer's time allowance (1.5 times the batch) can move, or the feed ends "time allowed used" with the mixing
 * tank still full and "a feed runs end to end" fails.
 */
const LATE_MS = 60;

test('the sped-up e2e rig empties the mixing tank even when every pump switches off late (B-008)', () => {
  const store = new Store(openDb(':memory:'));
  seedDemo(store, 'pi-1');
  speedUpRig(store);
  for (const p of ['pot-1-level', 'pot-1-ec', 'pot-1-ph', 'tank-mix'])
    store.addReading({
      probeId: p,
      value: p === 'tank-mix' ? 0 : p.includes('level') ? 20 : p.includes('ec') ? 1.0 : 6.2,
      at: Date.now(),
    });
  const bus = new Bus();
  const feeder = new Feeder(store, bus, {} as never, new Alerts(store, bus), { mixMs: 600_000, freshMs: 3_600_000 });
  const decision = feeder.preview('pot-1');
  assert.ok(decision.ok, JSON.stringify(decision));
  const { plan } = decision;

  const world = new MockWorld(() => 0);
  const pump = (id: string) => store.listActuators().find((a) => a.id === id)!;
  for (const step of plan.steps) {
    const a = pump(step.actuatorId);
    world.pumped(a, ((step.durationMs + LATE_MS) / 1000) * a.mlPerSecond!);
  }
  // The transfer as the agent's FeedRunner runs it: slices until the time allowed is used or the tank reads empty.
  const transfer = pump(plan.transfer.actuatorId);
  const mixProbe = { kind: 'water_level' as const, potId: null, tank: 'mix' as const };
  for (let elapsed = 0; elapsed < plan.transfer.maxMs;) {
    const slice = Math.min(plan.transfer.sliceMs, plan.transfer.maxMs - elapsed);
    world.pumped(transfer, (slice / 1000) * transfer.mlPerSecond!);
    elapsed += slice;
    if (world.read(mixProbe) <= plan.transfer.mixEmptyLevel) break;
  }
  // The same bound as the e2e test's "mixing tank emptied".
  assert.ok(world.mix.liters < 0.3, `${world.mix.liters.toFixed(2)} L left in the mixing tank`);
});
