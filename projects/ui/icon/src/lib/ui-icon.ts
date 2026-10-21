import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ICONES, type IconName } from './icones';

/**
 * Ícone SVG. O tamanho segue o font-size e a cor segue o texto (currentColor).
 * É decorativo (aria-hidden): quem usa dá o nome acessível ao botão/link em volta.
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
      @for (d of caminhos(); track $index) {
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

  protected readonly caminhos = computed<readonly string[]>(() => ICONES[this.name()]);
}
