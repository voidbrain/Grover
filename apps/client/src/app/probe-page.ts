import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { targetRange } from './format';
import { Hub } from './hub';

const RANGES = [
  { label: '24 h', ms: 86_400_000 },
  { label: '7 days', ms: 7 * 86_400_000 },
  { label: '30 days', ms: 30 * 86_400_000 },
] as const;

const W = 800;
const H = 260;
const PAD = { l: 44, r: 12, t: 12, b: 28 };

@Component({
  selector: 'gr-probe-page',
  imports: [RouterLink, DecimalPipe],
  template: `
    <p><a routerLink="/">← All rooms</a></p>
    @if (probe(); as p) {
      <h1>{{ p.name }}</h1>
      <div class="bar">
        <fieldset class="segmented">
          <legend class="sr-only">Time range</legend>
          @for (r of ranges; track r.label; let i = $index) {
            <label [class.selected]="range() === i">
              <input type="radio" name="range" [checked]="range() === i" (change)="range.set(i)" />{{ r.label }}
            </label>
          }
        </fieldset>
        @if (stats(); as s) {
          <p class="stats">min {{ s.min | number: '1.0-2' }} · avg {{ s.avg | number: '1.0-2' }} · max {{ s.max | number: '1.0-2' }} {{ unit() }} · {{ s.n }} readings</p>
        }
      </div>
      @if (readings.isLoading()) {
        <p role="status">Loading…</p>
      } @else if (chart(); as c) {
        <svg [attr.viewBox]="'0 0 ' + w + ' ' + h" role="img" [attr.aria-label]="p.name + ' over ' + ranges[range()].label">
          @if (c.band) {
            <rect [attr.x]="pad.l" [attr.width]="w - pad.l - pad.r" [attr.y]="c.band.y" [attr.height]="c.band.h" class="band" />
          }
          @for (t of c.ticks; track t.v) {
            <line [attr.x1]="pad.l" [attr.x2]="w - pad.r" [attr.y1]="t.y" [attr.y2]="t.y" class="grid" />
            <text [attr.x]="pad.l - 6" [attr.y]="t.y + 4" text-anchor="end">{{ t.v | number: '1.0-2' }}</text>
          }
          <path [attr.d]="c.path" class="line" />
        </svg>
      } @else {
        <p class="muted">No readings in this range.</p>
      }
    } @else {
      <p>Unknown probe.</p>
    }
  `,
  styles: `
    h1 {
      margin: 0 0 var(--space-3);
      font-size: 1.5rem;
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      align-items: center;
      margin-bottom: var(--space-3);
    }
    .stats,
    .muted {
      color: var(--muted);
      margin: 0;
      font-size: 0.875rem;
    }
    svg {
      width: 100%;
      height: auto;
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius);
    }
    .band {
      fill: var(--ok);
      opacity: 0.12;
    }
    .grid {
      stroke: var(--line);
    }
    text {
      fill: var(--muted);
      font-size: 11px;
    }
    .line {
      fill: none;
      stroke: var(--accent);
      stroke-width: 2;
      vector-effect: non-scaling-stroke;
    }
  `,
})
export class ProbePage {
  private readonly hub = inject(Hub);
  readonly id = input.required<string>();
  protected readonly ranges = RANGES;
  protected readonly range = signal(0);
  protected readonly w = W;
  protected readonly h = H;
  protected readonly pad = PAD;

  protected readonly probe = computed(() => this.hub.snapshot()?.probes.find((p) => p.id === this.id()) ?? null);
  protected readonly unit = computed(() => {
    const p = this.probe();
    return p ? (this.hub.snapshot()?.probeKinds[p.kind].unit ?? '') : '';
  });
  private readonly target = computed(() => {
    const p = this.probe();
    const room = this.hub.rooms().find((r) => r.id === p?.roomId);
    return p ? targetRange(p.kind, room?.phase?.phase ?? null) : null;
  });

  protected readonly readings = resource({
    params: () => ({
      id: this.id(),
      since: Date.now() - RANGES[this.range()].ms,
      latest: this.hub.latest().get(this.id())?.at,
    }),
    loader: ({ params }) => this.hub.readings(params.id, params.since),
  });

  protected readonly stats = computed(() => {
    const rs = this.readings.value() ?? [];
    if (!rs.length) return null;
    const vs = rs.map((r) => r.value);
    return { min: Math.min(...vs), max: Math.max(...vs), avg: vs.reduce((a, b) => a + b, 0) / vs.length, n: vs.length };
  });

  protected readonly chart = computed(() => {
    const rs = this.readings.value() ?? [];
    if (rs.length < 2) return null;
    const band = this.target();
    let lo = Math.min(...rs.map((r) => r.value), band?.min ?? Infinity);
    let hi = Math.max(...rs.map((r) => r.value), band?.max ?? -Infinity);
    if (hi - lo < 1e-6) {
      lo -= 1;
      hi += 1;
    }
    const pad = (hi - lo) * 0.08;
    lo -= pad;
    hi += pad;
    const t0 = rs[0]!.at;
    const t1 = rs.at(-1)!.at;
    const x = (t: number) => PAD.l + ((t - t0) / Math.max(1, t1 - t0)) * (W - PAD.l - PAD.r);
    const y = (v: number) => PAD.t + (1 - (v - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
    const path = rs.map((r, i) => `${i ? 'L' : 'M'}${x(r.at).toFixed(1)},${y(r.value).toFixed(1)}`).join('');
    const ticks = Array.from({ length: 5 }, (_, i) => {
      const v = lo + ((hi - lo) * i) / 4;
      return { v, y: y(v) };
    });
    return { path, ticks, band: band ? { y: y(band.max), h: y(band.min) - y(band.max) } : null };
  });
}
