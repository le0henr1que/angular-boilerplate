import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The browser's native options list, with its own look only:
 *
 *   <select ui-select id="status">
 *     <option value="a">A</option>
 *   </select>
 */
@Component({
  selector: 'select[ui-select]',
  template: '<ng-content />',
  styles: `
    :host {
      width: 100%;
      height: 2rem;
      padding: 0 calc(var(--space) * 8) 0 calc(var(--space) * 2.5);
      border: 1px solid var(--input);
      border-radius: var(--radius-lg);
      background-color: var(--background);
      /* Hand-drawn arrow (inline SVG), since appearance: none removes the native one. */
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
      background-position: right calc(var(--space) * 2.5) center;
      background-repeat: no-repeat;
      background-size: 1rem;
      color: inherit;
      font: inherit;
      font-size: var(--text-sm);
      appearance: none;
      cursor: pointer;
    }
    :host(:focus-visible) {
      outline: none;
      border-color: var(--ring);
      box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent);
    }
    :host(:disabled) {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSelect {}
