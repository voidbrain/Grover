import type { Store } from '../src/store.ts';

/**
 * Speeds the seeded demo rig up for the end-to-end test, so a feed takes about a second instead of minutes, and the
 * batch does not settle.
 *
 * Supply pumps get 100 times their flow, transfer pumps 1000 times (B-008). The simulated pumps deliver for as long
 * as they are really on, and on a busy runner a pump goes off tens of milliseconds late. At 1000 times the flow
 * that lateness added litres to the mixing tank, more than the transfer's time allowance (1.5 times the batch)
 * can move. At 100 times it adds about a tenth of that. Late transfer runs only move more, so they stay fast.
 */
export function speedUpRig(store: Store, roomId = 'grow-1'): void {
  for (const a of store.listActuators(roomId))
    if (a.mlPerSecond)
      store.putActuator({ ...a, mlPerSecond: a.mlPerSecond * (a.kind === 'pump_transfer' ? 1000 : 100) });
  store.putRoom({ ...store.getRoom(roomId), mixSettleSeconds: 0 });
}
