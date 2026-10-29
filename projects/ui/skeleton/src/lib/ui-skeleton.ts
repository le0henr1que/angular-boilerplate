import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Pulsing grey block, in place of content that is still loading.
 * By default it takes the full width and 1rem height; adjust with the consumer's CSS:
 *   <ui-skeleton class="title" />   →   .title { height: 2rem; width: 12rem; }
 */
@Component({
  selector: 'ui-skeleton',
  template: '',
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 1rem;
      border-radius: var(--radius-md);
      background: var(--muted);
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      50% {
        opacity: 0.5;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      :host {
        animation: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class UiSkeleton {}
