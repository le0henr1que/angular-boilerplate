import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ICONS } from './icons.constants';
import { type IconName } from './ui-icon.types';

/**
 * SVG icon. Its size follows the font-size and its color follows the text (currentColor).
 * It is decorative (aria-hidden): the user gives the accessible name to the surrounding button/link.
 *
 *   <ui-icon name="search" />
 */
@Component({
  selector: 'ui-icon',
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      @for (d of paths(); track $index) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      width: 1em;
      height: 1em;
      pointer-events: none;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[attr.data-name]': 'name()' },
})
export class UiIcon {
  readonly name = input.required<IconName>();

  protected readonly paths = computed<readonly string[]>(() => ICONS[this.name()]);
}
