import { Component, computed, inject, input, signal } from '@angular/core';
import type { Actuator } from '@grover/contracts';
import { Hub } from '../hub';

/**
 * A pump's state and a bounded run by hand: an amount (mL when calibrated, else seconds) and Run, disabled while it
 * waits or runs (B-005). Used by the room card and the rig map.
 */
@Component({
  selector: 'gr-pump-control',
  template: `
    @if (showName()) {
      <span class="name">
        @if (colour(); as c) {
          <span class="swatch" [style.background]="c"></span>
        }
        {{ pump().name }}</span
      >
    }
    <span class="state" [attr.data-state]="state()">{{ state() }}</span>
    <span class="run">
      <label class="sr-only" [for]="'amt-' + idPrefix() + pump().id"
        >{{ pump().name }} amount in {{ pump().mlPerSecond ? 'millilitres' : 'seconds' }}</label
      >
      <input
        [id]="'amt-' + idPrefix() + pump().id"
        type="number"
        min="0.1"
        step="0.5"
        [value]="amount()"
        (change)="setAmount($any($event.target).value)"
      />
      <span class="unit">{{ pump().mlPerSecond ? 'mL' : 's' }}</span>
      <button type="button" class="small" [disabled]="!canRun()" (click)="run()">Run</button>
    </span>
  `,
  styles: `
    :host {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--bx-space-2);
    }
    .state {
      font-size: 0.8125rem;
      color: var(--bx-text-muted);
    }
    .state[data-state='running'],
    .state[data-state='waiting'] {
      color: var(--bx-accent);
      font-weight: 600;
    }
    .run {
      display: inline-flex;
      align-items: center;
      gap: var(--bx-space-1);
      margin-left: auto;
    }
    input {
      width: 4.5rem;
    }
    .unit {
      color: var(--bx-text-muted);
      font-size: 0.8125rem;
    }
  `,
})
export class PumpControl {
  private readonly hub = inject(Hub);
  readonly pump = input.required<Actuator>();
  /** The tent allows runs now (agent online, normal mode). */
  readonly allowed = input(true);
  readonly showName = input(true);
  /** A supply pump's nutrient colour (F-017), shown beside its name. */
  readonly colour = input<string | null>(null);
  /** Keeps input ids unique when the same pump appears twice on a page. */
  readonly idPrefix = input('');

  private readonly chosen = signal<number | null>(null);
  protected readonly amount = computed(() => this.chosen() ?? (this.pump().mlPerSecond ? 5 : 2));
  protected readonly state = computed(() =>
    this.hub.active().has(this.pump().id) ? 'running' : this.hub.pendingRuns().has(this.pump().id) ? 'waiting' : 'off',
  );
  protected readonly canRun = computed(
    () => this.allowed() && this.state() === 'off' && !this.hub.busy().has('act:' + this.pump().id),
  );

  protected setAmount(value: string): void {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) this.chosen.set(n);
  }

  protected run(): void {
    const a = this.pump();
    const n = this.amount();
    // Keep Run disabled at most for the pump's cap plus a margin for the queue, in case the "off" report is lost.
    void this.hub.run(a.id, a.mlPerSecond ? { ml: n } : { durationMs: Math.round(n * 1000) }, a.maxRunMs + 60_000);
  }
}
