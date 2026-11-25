import type { Store } from '../src/store.ts';

/**
 * Speeds the seeded demo rig up for the end-to-end test, so a feed takes milliseconds instead of minutes: pumps
 * get a larger flow (mL per second) and the batch does not settle.
 */
export function speedUpRig(store: Store, roomId = 'grow-1'): void {
  for (const a of store.listActuators(roomId))
    if (a.mlPerSecond) store.putActuator({ ...a, mlPerSecond: a.mlPerSecond * 1000 });
  store.putRoom({ ...store.getRoom(roomId), mixSettleSeconds: 0 });
}
