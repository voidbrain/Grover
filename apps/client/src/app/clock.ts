import { DestroyRef, Service, inject, signal } from '@angular/core';

/** A coarse "now" for relative times and staleness, ticking every 10 s. */
@Service()
export class Clock {
  readonly now = signal(Date.now());
  constructor() {
    const t = setInterval(() => this.now.set(Date.now()), 10_000);
    inject(DestroyRef).onDestroy(() => clearInterval(t));
  }
}
