import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Commands } from '../src/commands.ts';
import { openDb } from '../src/db.ts';
import { Bus } from '../src/events.ts';
import { seedDemo } from '../src/seed.ts';
import { Store } from '../src/store.ts';

// B-004: a read answered by the agent must be stored when the request returns, not when the agent's separate
// reading event happens to arrive (CI lost that race: a feed planned right after a read saw no readings).
test('a probe read is stored as soon as the agent answers, and once', async () => {
  const store = new Store(openDb(':memory:'));
  seedDemo(store, 'pi-1');
  const bus = new Bus();
  const announced: number[] = [];
  bus.on((ev) => {
    if (ev.type === 'reading') announced.push(ev.reading.value);
  });
  const at = Date.now();
  // A fake agent that answers and never sends the reading event.
  const agents = {
    isOnline: () => true,
    command: async () => ({ id: 'c', ok: true, error: null, value: 1.23, at }),
  };
  const commands = new Commands(store, agents as never, bus);
  const result = await commands.readProbe('ec');
  assert.equal(result.value, 1.23);
  assert.deepEqual(store.latestReading('ec'), { probeId: 'ec', at, value: 1.23 });
  assert.deepEqual(announced, [1.23], 'announced to the dashboard');
  // The same reading arriving again (the agent's event) is not stored twice.
  assert.equal(store.addReading({ probeId: 'ec', at, value: 1.23 }), false);
});
