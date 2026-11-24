import {
  addDays,
  downsample,
  localMidnight,
  localTime,
  phaseTimeline,
  plantStats,
  type PlantReport,
  type PlantReportRange,
  type ProbeKind,
  type Reading,
} from '@grover/contracts';
import { NotFound, type Store } from './store.ts';

const POINTS = 400;
const RANGE_DAYS: Record<Exclude<PlantReportRange, 'all'>, number> = { day: 1, week: 7, month: 30 };

/**
 * The plant page (F-014): the plant's pot over its time in the tent (from the day it was placed, else its start,
 * to its harvest or today), with its phases, feeds and statistics. Days are local dates in the grow's time zone;
 * the report also gives them as instants (local midnights), so a browser in another zone draws them right.
 *
 * Runs inside the hub process (broker, feeds): each probe is read once between two instants, and readings get their
 * day in one pass against the day boundaries, never a date formatting per reading.
 */
export class PlantReports {
  private readonly store: Store;
  private readonly timeZone: string;
  private readonly now: () => number;

  constructor(store: Store, timeZone: string, now: () => number = Date.now) {
    this.store = store;
    this.timeZone = timeZone;
    this.now = now;
  }

  report(plantId: string, range: PlantReportRange): PlantReport {
    const plant = this.store.listPlants().find((p) => p.id === plantId);
    if (!plant) throw new NotFound(`plant ${plantId}`);
    const today = localTime(new Date(this.now()), this.timeZone).day;
    const start = plant.placedOn ?? plant.startedOn ?? today;
    const end = max(start, plant.harvestedOn ?? today);
    const from = range === 'all' ? start : max(start, addDays(end, 1 - RANGE_DAYS[range]));
    const midnight = (day: string) => localMidnight(day, this.timeZone);
    // Local midnights from `start` to the day after `end`: day i runs [bounds[i], bounds[i + 1]).
    const days: string[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
    const bounds = [...days, addDays(end, 1)].map(midnight);
    const startMs = bounds[0]!;
    const endMs = bounds.at(-1)!;
    const fromMs = midnight(from);

    const pot = plant.potId ? (this.store.listPots().find((p) => p.id === plant.potId) ?? null) : null;
    const room = pot ? this.store.getRoom(pot.roomId) : null;
    const calendar = room?.calendarId ? this.store.getCalendar(room.calendarId) : null;
    const timeline = (calendar ? phaseTimeline(calendar, plant, start, end) : []).map((s) => ({
      ...s,
      fromMs: midnight(s.from),
      toMs: midnight(addDays(s.to, 1)),
    }));

    // Its pot's probe of each kind, disabled ones too: history stays when a probe is switched off.
    const readings = (kind: ProbeKind): Reading[] => {
      const probe = pot ? this.store.potProbe(pot, kind, { includeDisabled: true }) : null;
      return probe ? this.store.readings(probe.id, startMs, endMs - 1, 1_000_000) : [];
    };
    /** Readings (ascending) with their local day, by walking the day boundaries once. */
    const withDay = (rs: readonly Reading[]) => {
      const out: { day: string; value: number }[] = [];
      let i = 0;
      for (const r of rs) {
        while (i < days.length - 1 && r.at >= bounds[i + 1]!) i++;
        out.push({ day: days[i]!, value: r.value });
      }
      return out;
    };
    const shown = (rs: readonly Reading[]) =>
      downsample(
        rs.filter((r) => r.at >= fromMs),
        POINTS,
      );
    const ec = readings('ec');
    const ph = readings('ph');

    const feeds = pot ? this.store.feeds(startMs, pot.id, 10_000).filter((f) => f.requestedAt < endMs) : [];
    const markers: PlantReport['markers'] = [];
    const day = (kind: 'placed' | 'bloom' | 'flush' | 'harvest', d: string | null) => {
      if (d) markers.push({ kind, day: d, at: midnight(d) });
    };
    day('placed', plant.placedOn);
    day('bloom', plant.bloomOn);
    day('flush', plant.flushOn);
    day('harvest', plant.harvestedOn);
    for (const f of feeds)
      if (f.requestedAt >= fromMs && f.state !== 'refused')
        markers.push({ kind: 'feed', at: f.requestedAt, state: f.state });

    return {
      plantId: plant.id,
      potId: pot?.id ?? null,
      from,
      to: end,
      fromMs,
      toMs: endMs,
      timeline,
      series: {
        level: shown(readings('water_level')),
        ec: shown(ec),
        ph: shown(ph),
        waterTemp: shown(readings('water_temperature')),
      },
      markers,
      stats: plantStats({
        placedOn: plant.placedOn,
        endDay: end,
        timeline,
        feeds,
        ec: withDay(ec),
        ph: withDay(ph),
        yieldGrams: plant.yieldGrams,
      }),
      feeds,
      alerts: pot && !plant.harvestedOn ? this.store.alerts().filter((a) => a.potId === pot.id) : [],
    };
  }
}

const max = (a: string, b: string) => (a > b ? a : b);
