import {
  addDays,
  downsample,
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
const DAY_MS = 86_400_000;
const RANGE_DAYS: Record<Exclude<PlantReportRange, 'all'>, number> = { day: 1, week: 7, month: 30 };

/**
 * The plant page (F-014): the plant's pot over its time in the tent (from the day it was placed, else its start,
 * to its harvest or today), with its phases, feeds and statistics. Days are local dates in the grow's time zone.
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

  private dayOf(at: number): string {
    return localTime(new Date(at), this.timeZone).day;
  }

  report(plantId: string, range: PlantReportRange): PlantReport {
    const plant = this.store.listPlants().find((p) => p.id === plantId);
    if (!plant) throw new NotFound(`plant ${plantId}`);
    const today = this.dayOf(this.now());
    const start = plant.placedOn ?? plant.startedOn ?? today;
    const end = plant.harvestedOn ?? today;
    const from = range === 'all' ? start : max(start, addDays(end, 1 - RANGE_DAYS[range]));
    const pot = plant.potId ? (this.store.listPots().find((p) => p.id === plant.potId) ?? null) : null;
    const room = pot ? this.store.getRoom(pot.roomId) : null;
    const calendar = room?.calendarId ? this.store.getCalendar(room.calendarId) : null;
    const timeline = calendar ? phaseTimeline(calendar, plant, start, end) : [];

    // Readings of its pot's probes on the days [a, b]; a day's slack on each side for the time zone.
    const readings = (kind: ProbeKind, a: string, b: string): Reading[] => {
      const probe = pot ? this.store.potProbe(pot, kind) : null;
      if (!probe) return [];
      return this.store
        .readings(probe.id, Date.parse(`${a}T00:00:00Z`) - DAY_MS, Date.parse(`${b}T00:00:00Z`) + 2 * DAY_MS, 1_000_000)
        .filter((r) => {
          const d = this.dayOf(r.at);
          return d >= a && d <= b;
        });
    };
    const series = (kind: ProbeKind) => downsample(readings(kind, from, end), POINTS);
    const withDay = (rs: Reading[]) => rs.map((r) => ({ day: this.dayOf(r.at), value: r.value }));

    const feeds = pot
      ? this.store.feeds(Date.parse(`${start}T00:00:00Z`) - DAY_MS, pot.id, 10_000).filter((f) => {
          const d = this.dayOf(f.requestedAt);
          return d >= start && d <= end;
        })
      : [];
    const markers: PlantReport['markers'] = [];
    if (plant.placedOn) markers.push({ kind: 'placed', day: plant.placedOn });
    if (plant.bloomOn) markers.push({ kind: 'bloom', day: plant.bloomOn });
    if (plant.flushOn) markers.push({ kind: 'flush', day: plant.flushOn });
    if (plant.harvestedOn) markers.push({ kind: 'harvest', day: plant.harvestedOn });
    for (const f of feeds)
      if (this.dayOf(f.requestedAt) >= from && f.state !== 'refused')
        markers.push({ kind: 'feed', at: f.requestedAt, state: f.state });

    return {
      plantId: plant.id,
      potId: pot?.id ?? null,
      from,
      to: end,
      timeline,
      series: {
        level: series('water_level'),
        ec: series('ec'),
        ph: series('ph'),
        waterTemp: series('water_temperature'),
      },
      markers,
      stats: plantStats({
        placedOn: plant.placedOn,
        endDay: end,
        timeline,
        feeds,
        ec: withDay(readings('ec', start, end)),
        ph: withDay(readings('ph', start, end)),
        yieldGrams: plant.yieldGrams,
      }),
      feeds,
      alerts: pot ? this.store.alerts().filter((a) => a.potId === pot.id) : [],
    };
  }
}

const max = (a: string, b: string) => (a > b ? a : b);
