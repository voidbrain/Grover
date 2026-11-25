import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Hub } from './hub';
import { RoomCard } from './room/room-card';

@Component({
  selector: 'gr-dashboard',
  imports: [RoomCard, DatePipe],
  template: `
    @for (room of hub.rooms(); track room.id) {
      <gr-room-card [room]="room" />
    } @empty {
      @if (hub.snapshot()) {
        <p class="empty">No rooms yet. Add one through the hub API (PUT /api/rooms/&lt;id&gt;).</p>
      } @else {
        <p class="empty" role="status">Connecting to the hub…</p>
      }
    }
    @if (hub.recent().length) {
      <section class="activity" aria-labelledby="activity-title">
        <h2 id="activity-title">Activity</h2>
        <ul>
          @for (a of hub.recent(); track $index) {
            <li>
              <time>{{ a.at | date: 'HH:mm:ss' }}</time>
              <span>{{ name(a.actuatorId) }} {{ a.state }}</span>
              <span class="muted">{{ a.source }}@if (a.ranMs) { · {{ a.ranMs / 1000 }} s }</span>
            </li>
          }
        </ul>
      </section>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--bx-space-6);
    }
    .empty {
      color: var(--bx-text-muted);
    }
    .activity h2 {
      font-size: 1rem;
      margin: 0 0 var(--bx-space-2);
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: var(--bx-space-1);
      font-size: 0.875rem;
    }
    li {
      display: flex;
      gap: var(--bx-space-3);
    }
    time,
    .muted {
      color: var(--bx-text-muted);
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class Dashboard {
  protected readonly hub = inject(Hub);
  private readonly names = computed(() => new Map((this.hub.snapshot()?.actuators ?? []).map((a) => [a.id, a.name])));
  protected name(id: string): string {
    return this.names().get(id) ?? id;
  }
}
