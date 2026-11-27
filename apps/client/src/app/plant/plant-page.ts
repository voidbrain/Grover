import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { PlantReport, PlantReportRange } from '@grover/contracts';
import { doseTank, generationLabel, geneticsLabel, lineage, tankColour } from '@grover/contracts/kinds';
import {
  BxLineChart,
  BxStackedBarChart,
  type ChartTone,
  type LineChartBand,
  type LineChartMarker,
  type StackedBarSeries,
} from '@voidbrain/bricks/components';
import { Hub } from '../hub';
import { dosesPerDay, localAxis, localStamp } from './plant-charts';

const RANGES: { id: PlantReportRange; label: string }[] = [
  { id: 'day', label: 'Today' },
  { id: 'week', label: 'Last week' },
  { id: 'month', label: 'Last month' },
  { id: 'all', label: 'From start' },
];

/** What feeds put in, by the tank they came from. */
const DOSE_TITLES: Record<string, string> = {
  water: 'Water',
  grow: 'Grow',
  micro: 'Micro',
  bloom: 'Bloom',
  ripen: 'Ripen',
  phDown: 'pH down',
};

/** One fixed tone (and so pattern order) per dose tank, whichever tanks a range shows. */
const DOSE_TONES: Record<string, ChartTone> = {
  grow: 'green',
  micro: 'blue',
  bloom: 'orange',
  ripen: 'warn',
  phDown: 'info',
};

const MARKER_TITLES = {
  placed: 'Into the tent',
  bloom: 'Switched to bloom',
  flush: 'Flush started',
  harvest: 'Harvested',
};

/** Whole days from one calendar date (YYYY-MM-DD) to another, whatever the browser's time zone. */
const daysFrom = (a: string, b: string) =>
  Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

interface LogLine {
  at: number;
  /** For whole-day events: the grow's date, shown as is (the hub's days, not the browser's). */
  day?: string;
  what: string;
  detail: string;
}

/** A plant's page (F-014): who it is, how its pot held over its time in the tent, what it was given. */
@Component({
  selector: 'gr-plant-page',
  imports: [RouterLink, DecimalPipe, PercentPipe, DatePipe, BxLineChart, BxStackedBarChart],
  templateUrl: './plant-page.html',
  styleUrl: './plant-page.scss',
})
export class PlantPage {
  private readonly hub = inject(Hub);
  readonly id = input.required<string>();
  /** A harvested plant's "today" is its last day in the tent. */
  protected readonly ranges = computed(() =>
    this.plant()?.harvestedOn ? RANGES.map((r) => (r.id === 'day' ? { ...r, label: 'Last day' } : r)) : RANGES,
  );
  protected readonly range = signal<PlantReportRange>('all');

  private readonly snap = this.hub.snapshot;
  protected readonly plant = computed(() => this.snap()?.plants.find((p) => p.id === this.id()) ?? null);
  protected readonly header = computed(() => {
    const p = this.plant();
    const snap = this.snap();
    if (!p || !snap) return null;
    const strain = snap.strains.find((s) => s.id === p.strainId);
    const breeder = snap.breeders.find((b) => b.id === (p.breederId ?? strain?.breederId));
    const mothers = lineage(p.id, snap.plants).map((m) => m.name);
    return {
      facts: [
        strain?.name,
        breeder?.name,
        strain ? geneticsLabel(strain.sativaPercent) : null,
        strain?.thcPercent != null ? `THC ${strain.thcPercent} %` : null,
      ]
        .filter(Boolean)
        .join(' · '),
      origin: generationLabel(p.generation) + (mothers.length ? ` of ${mothers.join(' ← ')}` : ''),
      pot: snap.pots.find((x) => x.id === p.potId)?.name ?? null,
      dates: [
        ['Started', p.startedOn],
        ['Into the tent', p.placedOn],
        ['Bloom', p.bloomOn],
        ['Flush', p.flushOn],
        ['Harvested', p.harvestedOn],
      ].filter((d): d is [string, string] => !!d[1]),
    };
  });

  /** What, in the plant's record, changes its report (a stable string: snapshots arrive often). */
  private readonly plantKey = computed(() => {
    const p = this.plant();
    return p ? [p.potId, p.placedOn, p.bloomOn, p.flushOn, p.harvestedOn, p.yieldGrams].join('|') : null;
  });

  /** Its pot's feeds and their states: a new feed or one finishing reloads the report. */
  private readonly feedsKey = computed(() => {
    const potId = this.plant()?.potId;
    return (this.snap()?.feeds ?? [])
      .filter((f) => f.potId === potId)
      .map((f) => `${f.feedId}:${f.state}`)
      .join(',');
  });

  protected readonly report = resource({
    params: () => ({
      id: this.id(),
      range: this.range(),
      // Reload when the pot gets news: a feed, or a plant change.
      feeds: this.feedsKey(),
      plant: this.plantKey(),
    }),
    loader: ({ params }) => this.hub.plantReport(params.id, params.range),
  });

  protected readonly current = computed(() => {
    const r = this.report.value();
    if (!r || this.plant()?.harvestedOn) return null;
    const span = r.timeline.at(-1);
    return span ? { name: span.name, day: daysFrom(span.from, r.to) + 1 } : null;
  });

  /** The readings charts: x in local wall-clock ms (localAxis), so the bricks axis labels read local time. */
  protected readonly charts = computed(() => {
    const r = this.report.value();
    if (!r) return [];
    const kinds = this.snap()?.probeKinds;
    const domain: [number, number] = [localAxis(r.fromMs), localAxis(r.toMs)];
    const bands = (pick: (s: PlantReport['timeline'][number]) => { min: number; max: number }): LineChartBand[] =>
      r.timeline.map((s) => ({ from: localAxis(s.fromMs), to: localAxis(s.toMs), ...pick(s) }));
    const markers: LineChartMarker[] = r.markers.map((m) =>
      m.kind === 'feed'
        ? { at: localAxis(m.at), label: `Feed (${m.state})` }
        : { at: localAxis(m.at), label: `${MARKER_TITLES[m.kind]} ${m.day}` },
    );
    const chart = (title: string, unit: string, points: { at: number; value: number }[], b: LineChartBand[]) => ({
      title,
      unit,
      series: [
        { name: title, points: points.map((p) => ({ x: localAxis(p.at), y: p.value, label: localStamp(p.at) })) },
      ],
      bands: b,
      markers,
      domain,
    });
    return [
      chart(
        'Level',
        kinds?.water_level.unit ?? 'cm',
        r.series.level,
        bands((s) => s.waterLevel),
      ),
      chart(
        'EC',
        kinds?.ec.unit ?? 'mS/cm',
        r.series.ec,
        bands((s) => s.ec),
      ),
      chart(
        'pH',
        kinds?.ph.unit ?? 'pH',
        r.series.ph,
        bands((s) => s.ph),
      ),
      chart(
        'Water temperature',
        kinds?.water_temperature.unit ?? '°C',
        r.series.waterTemp,
        bands((s) => s.waterTemp),
      ),
    ];
  });

  /** mL per tank per local day, from the finished feeds in the chosen range (F-029-T02). */
  protected readonly perDay = computed(() => {
    const r = this.report.value();
    if (!r) return null;
    const { days, tanks } = dosesPerDay(r.feeds, r.fromMs, r.toMs);
    const series: StackedBarSeries[] = tanks.map((t) => ({
      name: DOSE_TITLES[t.key] ?? t.key,
      values: t.values,
      tone: DOSE_TONES[t.key],
    }));
    return { days, series };
  });

  /** The tent of the plant's pot: its nutrient colours colour the dose bars (F-017). */
  private readonly potRoom = computed(() => {
    const potId = this.report.value()?.potId;
    const roomId = this.snap()?.pots?.find((p) => p.id === potId)?.roomId;
    return this.snap()?.rooms?.find((r) => r.id === roomId) ?? null;
  });

  protected readonly doses = computed(() => {
    const ml = this.report.value()?.stats.nutrientMl ?? {};
    const rows = Object.entries(ml)
      .filter(([, v]) => v > 0)
      .map(([tank, v]) => {
        const role = doseTank(tank);
        return { tank: DOSE_TITLES[tank] ?? tank, ml: v, colour: role ? tankColour(this.potRoom() ?? {}, role) : null };
      });
    const most = Math.max(1, ...rows.map((r) => r.ml));
    return rows.map((r) => ({ ...r, share: r.ml / most }));
  });

  protected readonly log = computed((): LogLine[] => {
    const r = this.report.value();
    if (!r) return [];
    const lines: LogLine[] = [];
    for (const f of r.feeds) {
      const ml = Object.values(f.ml ?? {}).reduce((a, v) => a + v, 0);
      const ec = f.ecBefore !== null ? `EC ${f.ecBefore}${f.ecAfter !== null ? ` → ${f.ecAfter}` : ''}` : null;
      const ph = f.phBefore !== null ? `pH ${f.phBefore}${f.phAfter !== null ? ` → ${f.phAfter}` : ''}` : null;
      const given = f.batchLiters !== null ? `${f.batchLiters} L, ${Math.round(ml * 10) / 10} mL` : null;
      lines.push({
        at: f.requestedAt,
        what: `Feed ${f.state}`,
        detail: [given, ec, ph, f.state === 'done' ? null : f.message].filter(Boolean).join(' · '),
      });
    }
    for (const s of r.timeline) lines.push({ at: s.fromMs, day: s.from, what: `Phase: ${s.name}`, detail: '' });
    for (const m of r.markers)
      if (m.kind !== 'feed') lines.push({ at: m.at, day: m.day, what: MARKER_TITLES[m.kind], detail: '' });
    return lines.sort((a, b) => b.at - a.at);
  });
}
