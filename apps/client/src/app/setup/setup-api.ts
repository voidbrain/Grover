import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Hub } from '../hub';
import { issueLines } from './drafts';

export type Entity = 'rooms' | 'pots' | 'probes' | 'actuators' | 'schedules' | 'calendars';

/** A save or delete that the hub refused, as lines to show next to the form. */
export class SetupError extends Error {
  readonly lines: string[];
  constructor(lines: string[]) {
    super(lines.join('\n'));
    this.lines = lines;
  }
}

function toSetupError(err: unknown): SetupError {
  const e = err as HttpErrorResponse;
  const body = e.error as { error?: string; issues?: { path: PropertyKey[]; message: string }[] } | null;
  if (body?.issues?.length) return new SetupError(issueLines(body.issues));
  if (body?.error) return new SetupError([body.error]);
  if (e.status === 0) return new SetupError(['Hub unreachable: nothing was saved.']);
  return new SetupError([e.message]);
}

/** Writes set-up changes to the hub, then refreshes the shared snapshot so every page sees them. */
@Service()
export class SetupApi {
  private readonly http = inject(HttpClient);
  private readonly hub = inject(Hub);

  async put<T extends { id: string }>(entity: Entity, item: T): Promise<T> {
    try {
      const { id, ...body } = item;
      const saved = await firstValueFrom(this.http.put<T>(`/api/${entity}/${encodeURIComponent(id)}`, body));
      await this.hub.refresh();
      return saved;
    } catch (err) {
      throw toSetupError(err);
    }
  }

  async remove(entity: Entity, id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`/api/${entity}/${encodeURIComponent(id)}`));
      await this.hub.refresh();
    } catch (err) {
      throw toSetupError(err);
    }
  }

  /** Registers an agent or replaces its token. The token is only ever returned here. */
  async issueToken(agentId: string): Promise<string> {
    try {
      const res = await firstValueFrom(
        this.http.post<{ token: string }>(`/api/agents/${encodeURIComponent(agentId)}/token`, {}),
      );
      await this.hub.refresh();
      return res.token;
    } catch (err) {
      throw toSetupError(err);
    }
  }

  async removeAgent(agentId: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`/api/agents/${encodeURIComponent(agentId)}`));
      await this.hub.refresh();
    } catch (err) {
      throw toSetupError(err);
    }
  }
}
