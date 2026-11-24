import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, model, signal } from '@angular/core';
import type { Calibration, Probe, ProbeKind } from '@grover/contracts';
import { applyCalibration, calibrationProblem, usableTemp } from '@grover/contracts/kinds';
import { Hub } from '../hub';

/**
 * Calibration of a saved probe (F-004): read the probe raw while it sits in a reference solution, enter the
 * solution's value, add the point. Two points (pH 4 and 7) for pH; one (the calibration solution) for EC.
 * Saved with the probe.
 */
@Component({
  selector: 'gr-probe-calibration',
  imports: [DecimalPipe],
  template: `
    <fieldset class="cal">
      <legend>Calibration</legend>
      <p class="hint">{{ guide() }}</p>
      @if (points().length) {
        <ul class="points">
          @for (p of points(); track $index) {
            <li>
              raw {{ p.raw | number: '1.0-4' }} → {{ p.value }}
              @if (p.tempC !== null) {
                <span class="hint">at {{ p.tempC }} °C</span>
              }
              <span class="hint">{{ p.takenOn }}</span>
              <button type="button" class="ghost small" (click)="removePoint($index)" [attr.aria-label]="'Remove point ' + ($index + 1)">
                Remove
              </button>
            </li>
          }
        </ul>
      } @else {
        <p class="hint">Not calibrated: readings are used as the probe gives them.</p>
      }
      <div class="row">
        <button type="button" class="ghost small" [disabled]="reading() || !online()" (click)="readNow()">Read now</button>
        @if (!online()) {
          <span class="hint">The agent is offline: nothing to read.</span>
        }
        @if (last(); as l) {
          <span>
            raw {{ l.raw | number: '1.0-4' }}
            @if (l.tempC !== null) {
              <span class="hint">· water {{ l.tempC }} °C</span>
            }
            @if (calibration(); as c) {
              <span class="hint">· now reads {{ preview(l.raw, l.tempC, c) }}</span>
            }
          </span>
        }
      </div>
      @if (last()) {
        <div class="row">
          <label class="field">
            Reference value
            <input type="text" inputmode="decimal" [value]="reference()" (input)="reference.set($any($event.target).value)" />
          </label>
          <button type="button" class="small" [disabled]="!canAdd()" (click)="addPoint()">Add point</button>
        </div>
      }
      <div class="row">
        <label class="field">
          Compensation
          <select [value]="compensation()" (change)="setCompensation($any($event.target).value)">
            <option value="none">None</option>
            <option value="ph">pH (electrode slope by temperature)</option>
            <option value="ec">EC (to 25 °C)</option>
          </select>
        </label>
        @if (compensation() !== 'none') {
          <label class="field">
            Water temperature from
            <select [value]="tempProbeId()" (change)="setTempProbe($any($event.target).value)">
              <option value="">Not compensated</option>
              @for (t of tempProbes(); track t.id) {
                <option [value]="t.id">{{ t.name }}</option>
              }
            </select>
          </label>
        }
      </div>
      @if (problem(); as p) {
        <p class="form-errors" role="alert">Not saved like this: {{ p }}.</p>
      }
      @if (error()) {
        <p class="form-errors" role="alert">{{ error() }}</p>
      }
    </fieldset>
  `,
  styles: `
    .cal {
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: var(--space-3);
      margin: var(--space-3) 0 0;
      display: grid;
      gap: var(--space-2);
      legend {
        font-size: 0.8125rem;
        color: var(--muted);
      }
    }
    .points {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: var(--space-1);
      li {
        display: flex;
        gap: var(--space-2);
        align-items: center;
        font-size: 0.875rem;
      }
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      align-items: end;
    }
  `,
})
export class ProbeCalibration {
  private readonly hub = inject(Hub);
  readonly probeId = input.required<string>();
  readonly kind = input.required<ProbeKind>();
  /** Whether the tent's agent is online (Read now needs it). */
  readonly online = input(true);
  readonly tempProbes = input<readonly Probe[]>([]);
  readonly calibration = model<Calibration | null>(null);

  /** Choices made before the first point; kept in the calibration once it exists. */
  private readonly pendingCompensation = signal<Calibration['compensation'] | null>(null);
  private readonly pendingTempProbe = signal<string | null | undefined>(undefined);

  protected readonly points = computed(() => this.calibration()?.points ?? []);
  protected readonly compensation = computed<Calibration['compensation']>(
    () =>
      this.calibration()?.compensation ??
      this.pendingCompensation() ??
      (this.kind() === 'ph' ? 'ph' : this.kind() === 'ec' ? 'ec' : 'none'),
  );
  protected readonly tempProbeId = computed(() => {
    const c = this.calibration();
    if (c) return c.tempProbeId ?? '';
    const pending = this.pendingTempProbe();
    return pending === undefined ? (this.tempProbes()[0]?.id ?? '') : (pending ?? '');
  });
  protected readonly last = signal<{ raw: number; tempC: number | null } | null>(null);
  protected readonly reference = signal('');
  protected readonly reading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly canAdd = computed(() => this.last() !== null && /^\s*-?\d+(\.\d+)?\s*$/.test(this.reference()));
  /** Why the hub would refuse these points (the same check it runs), or null. */
  protected readonly problem = computed(() => {
    const c = this.calibration();
    return c ? calibrationProblem(c, this.kind()) : null;
  });
  protected readonly guide = computed(() =>
    this.kind() === 'ph'
      ? 'Rinse the probe, put it in buffer pH 7, Read now, enter 7, Add point; then the same with buffer pH 4. Save.'
      : this.kind() === 'ec'
        ? 'Put the probe in the calibration solution (e.g. 1.413 mS/cm at 25 °C), Read now, enter its value, Add point. Save.'
        : 'Read now next to a reference, enter the true value, Add point. Save.',
  );

  /** What the probe would report for this raw value, with the agent's own maths and compensation. */
  protected preview(raw: number, tempC: number | null, c: Calibration): number {
    return applyCalibration(raw, c, tempC);
  }

  protected async readNow(): Promise<void> {
    this.reading.set(true);
    this.error.set(null);
    try {
      const r = await this.hub.readRaw(this.probeId());
      this.last.set({ raw: r.raw, tempC: usableTemp(r.tempC) ? r.tempC : null });
    } catch (err) {
      const e = err as { error?: { error?: string }; message?: string };
      this.error.set(e.error?.error ?? e.message ?? 'Could not read the probe.');
    } finally {
      this.reading.set(false);
    }
  }

  protected addPoint(): void {
    const l = this.last();
    if (!l || !this.canAdd()) return;
    const point = {
      raw: l.raw,
      value: Number(this.reference()),
      tempC: l.tempC,
      takenOn: new Date().toISOString().slice(0, 10),
    };
    const current = this.calibration();
    this.calibration.set({
      points: [...(current?.points ?? []), point].slice(-8),
      compensation: this.compensation(),
      tempProbeId: this.tempProbeId() || null,
      calibratedAt: current?.calibratedAt ?? null,
    });
    this.reference.set('');
  }

  protected removePoint(i: number): void {
    const c = this.calibration();
    if (!c) return;
    const points = c.points.filter((_, j) => j !== i);
    if (!points.length) {
      // Keep the choices for the next first point.
      this.pendingCompensation.set(c.compensation);
      this.pendingTempProbe.set(c.tempProbeId);
    }
    this.calibration.set(points.length ? { ...c, points } : null);
  }

  protected setCompensation(value: Calibration['compensation']): void {
    const c = this.calibration();
    if (c) this.calibration.set({ ...c, compensation: value });
    else this.pendingCompensation.set(value);
  }

  protected setTempProbe(id: string): void {
    const c = this.calibration();
    if (c) this.calibration.set({ ...c, tempProbeId: id || null });
    else this.pendingTempProbe.set(id || null);
  }
}
