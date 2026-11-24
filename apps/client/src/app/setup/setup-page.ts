import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, pattern, required, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { Clock } from '../clock';
import { ago } from '../format';
import { Hub } from '../hub';
import { ID_PATTERN } from './drafts';
import { EditorRun } from './editor-run';
import { FieldError } from './field-error';
import { SetupApi } from './setup-api';

/** Setup overview: rooms, grow calendars and agents. */
@Component({
  selector: 'gr-setup-page',
  imports: [RouterLink, FormField, FieldError],
  template: `
    <h1>Setup</h1>

    <section aria-labelledby="rooms-title">
      <div class="section-head">
        <h2 id="rooms-title">Rooms</h2>
        <a class="button-link" routerLink="/setup/rooms/new">Add room</a>
      </div>
      @if (rooms().length) {
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr><th scope="col">Room</th><th scope="col">Agent</th><th scope="col">Probes</th><th scope="col">Pumps and switches</th><th scope="col">Calendar</th></tr>
            </thead>
            <tbody>
              @for (r of rooms(); track r.room.id) {
                <tr>
                  <td><a [routerLink]="['/setup/rooms', r.room.id]">{{ r.room.name }}</a></td>
                  <td>{{ r.room.agentId ?? 'none' }}</td>
                  <td>{{ r.probes }}</td>
                  <td>{{ r.actuators }}</td>
                  <td>{{ r.calendar }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <p class="empty">No rooms yet. A room is one tent with its tanks, pots and one Raspberry Pi.</p>
      }
    </section>

    <section aria-labelledby="calendars-title">
      <div class="section-head">
        <h2 id="calendars-title">Grow calendars</h2>
        <a class="button-link" routerLink="/setup/calendars/new">Add calendar</a>
      </div>
      <ul class="plain">
        @for (c of calendars(); track c.id) {
          <li>
            <a [routerLink]="['/setup/calendars', c.id]">{{ c.name }}</a>
            <span class="muted">{{ c.phases.length }} phases · {{ days(c.phases) }} days</span>
          </li>
        }
      </ul>
    </section>

    <section aria-labelledby="agents-title">
      <div class="section-head"><h2 id="agents-title">Agents</h2></div>
      <p class="hint">An agent is the Grover service on a Raspberry Pi. Register it here, then put its id and token in the Pi's <code>/etc/grover/agent.env</code>.</p>
      @if (agents().length) {
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th scope="col">Agent</th><th scope="col">Status</th><th scope="col">Room</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
            <tbody>
              @for (a of agents(); track a.agentId) {
                <tr>
                  <td>{{ a.agentId }}</td>
                  <td>{{ a.online ? 'online' : 'offline, last seen ' + ago(a.lastSeen) }}</td>
                  <td>{{ roomName(a.roomId) }}</td>
                  <td class="actions">
                    <button type="button" class="ghost small" [disabled]="run.busy()" (click)="rotate(a.agentId)">New token</button>
                    <button type="button" class="danger small" [disabled]="run.busy()" (click)="remove(a.agentId)">Remove</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <form class="register" (submit)="register($event)" novalidate aria-label="Register an agent">
        <label class="field">
          New agent id
          <input type="text" [formField]="f.id" placeholder="pi-1" />
          <gr-field-error [state]="f.id()" />
        </label>
        <button type="submit" [disabled]="run.busy()">Register</button>
      </form>

      @if (issued(); as t) {
        <div class="token" role="status">
          <p>
            Token for <strong>{{ t.agentId }}</strong>. It is shown only now: copy it to the Pi.
          </p>
          <pre><code>GROVER_AGENT_ID={{ t.agentId }}
GROVER_AGENT_TOKEN={{ t.token }}</code></pre>
          <div class="form-actions">
            <button type="button" class="ghost small" (click)="copy(t)">{{ copied() ? 'Copied' : 'Copy' }}</button>
            <button type="button" class="ghost small" (click)="issued.set(null)">Done</button>
          </div>
        </div>
      }
      @if (run.errors().length) {
        <ul class="form-errors" role="alert">
          @for (e of run.errors(); track $index) {
            <li>{{ e }}</li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-6);
    }
    h1 {
      margin: 0;
      font-size: 1.5rem;
    }
    section {
      display: grid;
      gap: var(--space-3);
    }
    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      h2 {
        margin: 0;
        font-size: 1.125rem;
      }
    }
    .button-link {
      font-size: 0.875rem;
      padding: var(--space-2) var(--space-4);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      color: var(--text);
      text-decoration: none;
    }
    .plain {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: var(--space-2);
      li {
        display: flex;
        gap: var(--space-3);
        align-items: baseline;
      }
    }
    .muted,
    .empty {
      color: var(--muted);
      font-size: 0.875rem;
      margin: 0;
    }
    .register {
      display: flex;
      gap: var(--space-3);
      align-items: end;
      max-width: 28rem;
      .field {
        flex: 1;
      }
    }
    .token {
      border: 1px solid var(--accent);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      background: var(--surface);
      p {
        margin: 0 0 var(--space-2);
      }
      pre {
        margin: 0;
        padding: var(--space-3);
        background: var(--surface-2);
        border-radius: var(--radius);
        overflow-x: auto;
        font-size: 0.8125rem;
      }
    }
  `,
})
export class SetupPage {
  private readonly hub = inject(Hub);
  private readonly api = inject(SetupApi);
  private readonly clock = inject(Clock);

  protected readonly rooms = computed(() => {
    const s = this.hub.snapshot();
    if (!s) return [];
    return s.rooms.map((room) => ({
      room,
      probes: s.probes.filter((p) => p.roomId === room.id).length,
      actuators: s.actuators.filter((a) => a.roomId === room.id).length,
      calendar: s.calendars.find((c) => c.id === room.calendarId)?.name ?? 'none',
    }));
  });
  protected readonly calendars = computed(() => this.hub.snapshot()?.calendars ?? []);
  protected readonly agents = computed(() => this.hub.snapshot()?.agents ?? []);

  protected readonly model = signal({ id: '' });
  protected readonly f = form(this.model, (p) => {
    required(p.id, { message: 'An id like pi-1' });
    pattern(p.id, ID_PATTERN, { message: 'Lowercase letters, digits, - and _' });
  });
  protected readonly run = new EditorRun();
  protected readonly issued = signal<{ agentId: string; token: string } | null>(null);
  protected readonly copied = signal(false);

  protected days(phases: readonly { days: number }[]): number {
    return phases.reduce((n, p) => n + p.days, 0);
  }
  protected ago(at: number | null): string {
    return ago(at, this.clock.now());
  }
  protected roomName(id: string | null): string {
    return id ? (this.hub.snapshot()?.rooms.find((r) => r.id === id)?.name ?? id) : 'none';
  }

  protected async register(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.f, async () => {
      const agentId = this.model().id;
      if (this.agents().some((a) => a.agentId === agentId)) {
        this.run.errors.set([`${agentId} is already registered: use "New token" to replace its token.`]);
        return;
      }
      await this.issue(agentId);
      this.model.set({ id: '' });
      this.f().reset();
    });
  }

  protected async rotate(agentId: string): Promise<void> {
    if (confirm(`Replace the token of ${agentId}? The Pi stops connecting until you give it the new one.`))
      await this.issue(agentId);
  }

  protected async remove(agentId: string): Promise<void> {
    if (!confirm(`Remove ${agentId}? Its token stops working and its room is left without an agent.`)) return;
    await this.run.run(
      () => this.api.removeAgent(agentId),
      () => this.issued.set(null),
    );
  }

  private async issue(agentId: string): Promise<void> {
    let token = '';
    await this.run.run(
      async () => (token = await this.api.issueToken(agentId)),
      () => {
        this.copied.set(false);
        this.issued.set({ agentId, token });
      },
    );
  }

  protected async copy(t: { agentId: string; token: string }): Promise<void> {
    try {
      await navigator.clipboard.writeText(`GROVER_AGENT_ID=${t.agentId}\nGROVER_AGENT_TOKEN=${t.token}\n`);
      this.copied.set(true);
    } catch {
      this.run.errors.set(['The browser did not allow copying: select the text and copy it by hand.']);
    }
  }
}
