import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

export interface ChartBand {
  from: number;
  to: number;
  min: number;
  max: number;
}
export interface ChartMarker {
  at: number;
  label: string;
}

const W = 800;
const H = 200;
const PAD = { l: 44, r: 12, t: 12, b: 24 };

/** One probe of a plant's pot over time (F-014): the line, each phase's range as a band, markers for events. */
@Component({
  selector: 'gr-plant-chart',
  imports: [DecimalPipe],
  template: `
    <figure>
      <figcaption>
        {{ title() }}
        @if (last(); as l) {
          <span class="now">{{ l | number: '1.0-2' }} {{ unit() }}</span>
        }
      </figcaption>
      @if (chart(); as c) {
        <svg [attr.viewBox]="'0 0 ' + w + ' ' + h" role="img" [attr.aria-label]="title() + ', ' + points().length + ' readings'">
          @for (b of c.bands; track $index) {
            <rect [attr.x]="b.x" [attr.width]="b.w" [attr.y]="b.y" [attr.height]="b.h" class="band" />
          }
          @for (t of c.ticks; track t.v) {
            <line [attr.x1]="pad.l" [attr.x2]="w - pad.r" [attr.y1]="t.y" [attr.y2]="t.y" class="grid" />
            <text [attr.x]="pad.l - 6" [attr.y]="t.y + 4" text-anchor="end">{{ t.v | number: '1.0-2' }}</text>
          }
          @for (m of c.markers; track $index) {
            <line [attr.x1]="m.x" [attr.x2]="m.x" [attr.y1]="pad.t" [attr.y2]="h - pad.b" class="marker">
              <title>{{ m.label }}</title>
            </line>
          }
          <path [attr.d]="c.path" class="line" />
          <text [attr.x]="pad.l" [attr.y]="h - 6">{{ c.start }}</text>
          <text [attr.x]="w - pad.r" [attr.y]="h - 6" text-anchor="end">{{ c.end }}</text>
        </svg>
      } @else {
        <p class="muted">No readings in this range.</p>
      }
    </figure>
  `,
  styles: `
    figure {
      margin: 0;
      display: grid;
      gap: var(--bx-space-1);
    }
    figcaption {
      font-size: 0.8125rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--bx-text-muted);
      display: flex;
      justify-content: space-between;
    }
    .now {
      text-transform: none;
      letter-spacing: 0;
      color: var(--bx-text);
      font-variant-numeric: tabular-nums;
    }
    svg {
      width: 100%;
      height: auto;
      background: var(--bx-surface-raised);
      border: 1px solid var(--bx-border);
      border-radius: var(--bx-radius);
    }
    .band {
      fill: var(--bx-ok);
      opacity: 0.12;
    }
    .grid {
      stroke: var(--bx-border);
    }
    .marker {
      stroke: var(--bx-text-muted);
      stroke-dasharray: 3 3;
      vector-effect: non-scaling-stroke;
    }
    text {
      fill: var(--bx-text-muted);
      font-size: 11px;
    }
    .line {
      fill: none;
      stroke: var(--bx-accent);
      stroke-width: 2;
      vector-effect: non-scaling-stroke;
    }
    .muted {
      color: var(--bx-text-muted);
      margin: 0;
      font-size: 0.875rem;
    }
  `,
})
export class PlantChart {
  readonly title = input.required<string>();
  readonly unit = input('');
  readonly points = input<readonly { at: number; value: number }[]>([]);
  readonly bands = input<readonly ChartBand[]>([]);
  readonly markers = input<readonly ChartMarker[]>([]);
  /** The time shown, in ms. */
  readonly from = input.required<number>();
  readonly to = input.required<number>();

  protected readonly w = W;
  protected readonly h = H;
  protected readonly pad = PAD;
  protected readonly last = computed(() => this.points().at(-1)?.value ?? null);

  protected readonly chart = computed(() => {
    const rs = this.points();
    if (rs.length < 1) return null;
    const t0 = this.from();
    const t1 = Math.max(this.to(), t0 + 1);
    const bands = this.bands().filter((b) => b.to > t0 && b.from < t1);
    let lo = Math.min(...rs.map((r) => r.value), ...bands.map((b) => b.min));
    let hi = Math.max(...rs.map((r) => r.value), ...bands.map((b) => b.max));
    if (hi - lo < 1e-6) {
      lo -= 1;
      hi += 1;
    }
    const pad = (hi - lo) * 0.08;
    lo -= pad;
    hi += pad;
    const x = (t: number) => PAD.l + ((Math.min(Math.max(t, t0), t1) - t0) / (t1 - t0)) * (W - PAD.l - PAD.r);
    const y = (v: number) => PAD.t + (1 - (v - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
    const path = rs.map((r, i) => `${i ? 'L' : 'M'}${x(r.at).toFixed(1)},${y(r.value).toFixed(1)}`).join('');
    const day = (t: number) => {
      const d = new Date(t);
      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    return {
      path,
      ticks: Array.from({ length: 4 }, (_, i) => {
        const v = lo + ((hi - lo) * i) / 3;
        return { v, y: y(v) };
      }),
      bands: bands.map((b) => ({ x: x(b.from), w: x(b.to) - x(b.from), y: y(b.max), h: y(b.min) - y(b.max) })),
      markers: this.markers()
        .filter((m) => m.at >= t0 && m.at <= t1)
        .map((m) => ({ x: x(m.at), label: m.label })),
      start: day(t0),
      end: day(t1 - 1),
    };
  });
}
