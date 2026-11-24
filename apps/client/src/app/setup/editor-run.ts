import { signal } from '@angular/core';
import { SetupError } from './setup-api';

/** Busy flag and error lines for one form: every editor saves and deletes through this. */
export class EditorRun {
  readonly errors = signal<string[]>([]);
  readonly busy = signal(false);

  /** Runs `action`; on success calls `then`, on failure shows the hub's or the schema's reasons. */
  async run(action: () => Promise<unknown>, then: () => void): Promise<void> {
    this.busy.set(true);
    this.errors.set([]);
    try {
      await action();
      then();
    } catch (err) {
      this.errors.set(err instanceof SetupError ? err.lines : [(err as Error).message]);
    } finally {
      this.busy.set(false);
    }
  }
}
