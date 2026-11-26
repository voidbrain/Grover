import type { Store } from './store.ts';

/** Readings of the last this many days are kept as they came; older ones one per probe per hour. */
export const READINGS_FULL_DAYS = 30;
const DAY = 24 * 3_600_000;

/**
 * Downsamples old readings now and every hour after, so the database on the Pi's SD card stops growing with the
 * five-minute readings. Returns a stop function.
 */
export function startRetention(store: Store, now: () => number = Date.now): () => void {
  const run = () => store.downsampleReadings(now() - READINGS_FULL_DAYS * DAY);
  run();
  const timer = setInterval(run, 3_600_000);
  timer.unref();
  return () => clearInterval(timer);
}
