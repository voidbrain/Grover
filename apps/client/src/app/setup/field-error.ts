import { Component, input } from '@angular/core';

/** The first error of a field, once the user has touched it (or tried to save). */
@Component({
  selector: 'gr-field-error',
  template: `
    @if (state().touched() && state().errors().length) {
      <span class="field-error" role="alert">{{ state().errors()[0]!.message ?? 'Check this value' }}</span>
    }
  `,
  styles: `
    .field-error {
      color: var(--bad);
      font-size: 0.75rem;
    }
  `,
})
export class FieldError {
  readonly state = input.required<{ touched(): boolean; errors(): readonly { message?: string }[] }>();
}
