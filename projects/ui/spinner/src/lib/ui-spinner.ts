import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Loading indicator. Its size follows the font-size and its color follows the text (currentColor).
 * Give it an accessible name: <ui-spinner aria-label="Carregando" />
 */
@Component({
  selector: 'ui-spinner',
  template: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      width: 1em;
      height: 1em;
    }
    svg {
      width: 100%;
      height: 100%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      svg {
        animation-duration: 2.4s;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'status' },
})
export class UiSpinner {}
