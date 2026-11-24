import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Hub } from './hub';

@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'gr-root',
  template: `
    <a class="skip" href="#main">Skip to content</a>
    <header class="top">
      <a routerLink="/" class="brand">Grover</a>
      <span class="conn" [class.down]="!hub.connected()" role="status">
        {{ hub.connected() ? 'Live' : 'Offline: last known data' }}
      </span>
    </header>
    @if (hub.lastError(); as err) {
      <div class="alert" role="alert">
        <span>{{ err }}</span>
        <button type="button" class="ghost small" (click)="hub.lastError.set(null)">Dismiss</button>
      </div>
    }
    <main id="main" tabindex="-1">
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: block;
      max-width: 72rem;
      margin: 0 auto;
      padding: var(--space-4) var(--space-4) var(--space-6);
    }
    .top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-5);
    }
    .brand {
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--text);
      text-decoration: none;
      letter-spacing: -0.01em;
    }
    .conn {
      font-size: 0.8125rem;
      padding: var(--space-1) var(--space-3);
      border-radius: 999px;
      background: color-mix(in srgb, var(--ok) 18%, transparent);
      &.down {
        background: color-mix(in srgb, var(--warn) 22%, transparent);
      }
    }
    .alert {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      margin-bottom: var(--space-4);
      border-radius: var(--radius);
      border: 1px solid var(--bad);
      background: color-mix(in srgb, var(--bad) 10%, var(--surface));
    }
    main:focus {
      outline: none;
    }
  `,
})
export class App {
  protected readonly hub = inject(Hub);
}
