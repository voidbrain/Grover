import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Hub } from './hub';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'gr-root',
  template: `
    <a class="skip" href="#main">Skip to content</a>
    <header class="top">
      <a routerLink="/" class="brand">Grover</a>
      <nav aria-label="Main">
        <a routerLink="/" routerLinkActive="current" [routerLinkActiveOptions]="{ exact: true }" ariaCurrentWhenActive="page">Dashboard</a>
        <a routerLink="/setup" routerLinkActive="current" ariaCurrentWhenActive="page">Setup</a>
      </nav>
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
      padding: var(--bx-space-4) var(--bx-space-4) var(--gr-space-10);
    }
    .top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--bx-space-6);
    }
    .brand {
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--bx-text);
      text-decoration: none;
      letter-spacing: -0.01em;
    }
    nav {
      display: flex;
      gap: var(--bx-space-4);
      margin-right: auto;
      margin-left: var(--bx-space-6);
      a {
        color: var(--bx-text-muted);
        text-decoration: none;
        font-size: 0.9375rem;
        padding: var(--bx-space-1) 0;
        border-bottom: 2px solid transparent;
        &.current {
          color: var(--bx-text);
          border-bottom-color: var(--bx-accent);
        }
      }
    }
    .conn {
      font-size: 0.8125rem;
      padding: var(--bx-space-1) var(--bx-space-3);
      border-radius: 999px;
      background: color-mix(in srgb, var(--bx-ok) 18%, transparent);
      &.down {
        background: color-mix(in srgb, var(--bx-warn) 22%, transparent);
      }
    }
    .alert {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--bx-space-3);
      padding: var(--bx-space-3) var(--bx-space-4);
      margin-bottom: var(--bx-space-4);
      border-radius: var(--bx-radius);
      border: 1px solid var(--bx-danger);
      background: color-mix(in srgb, var(--bx-danger) 10%, var(--bx-surface-raised));
    }
    main:focus {
      outline: none;
    }
  `,
})
export class App {
  protected readonly hub = inject(Hub);
}
