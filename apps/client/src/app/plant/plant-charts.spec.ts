import type { FeedView } from '@grover/contracts';
import { dosesPerDay, localAxis, localStamp } from './plant-charts';

/** Local wall-clock instants, so these checks hold in any browser time zone. */
const at = (day: number, hour: number, minute = 0) => new Date(2026, 10, day, hour, minute).getTime();

const feed = (over: Partial<FeedView>): FeedView => ({
  feedId: 'f',
  roomId: 'tent-1',
  potId: 'pot-3',
  source: 'manual',
  state: 'done',
  message: '',
  requestedAt: at(1, 8),
  finishedAt: null,
  batchLiters: 1.5,
  ml: null,
  ecBefore: null,
  phBefore: null,
  ecAfter: null,
  phAfter: null,
  potLitersBefore: null,
  expectedEc: null,
  expectedPh: null,
  ...over,
});

describe('plant chart data', () => {
  it('moves an instant so that UTC labels read the local wall clock', () => {
    const t = at(24, 23, 40);
    const shifted = new Date(localAxis(t));
    expect([shifted.getUTCMonth(), shifted.getUTCDate(), shifted.getUTCHours(), shifted.getUTCMinutes()]).toEqual([
      10, 24, 23, 40,
    ]);
  });

  it('stamps a point with its local date and time', () => {
    expect(localStamp(at(2, 7, 5))).toBe('2026-11-02 07:05');
  });

  it('sums what finished feeds gave per local day and per tank, without water', () => {
    const feeds = [
      feed({ requestedAt: at(1, 8), ml: { water: 1400, grow: 10, micro: 6 } }),
      feed({ requestedAt: at(1, 23, 30), ml: { water: 900, grow: 2.5 } }),
      feed({ requestedAt: at(2, 0, 10), ml: { water: 1000, grow: 3, phDown: 1.2 } }),
      feed({ requestedAt: at(2, 9), state: 'aborted', ml: { water: 300, grow: 4 } }),
      feed({ requestedAt: at(5, 9), ml: { water: 1000, bloom: 9 } }),
    ];
    expect(dosesPerDay(feeds, at(1, 0), at(4, 0))).toEqual({
      days: ['11-01', '11-02'],
      tanks: [
        { key: 'grow', values: [12.5, 3] },
        { key: 'micro', values: [6, 0] },
        { key: 'phDown', values: [0, 1.2] },
      ],
    });
  });

  it('has no days without finished feeds', () => {
    expect(dosesPerDay([feed({ state: 'refused', ml: { grow: 5 } })], at(1, 0), at(4, 0))).toEqual({
      days: [],
      tanks: [],
    });
  });
});
