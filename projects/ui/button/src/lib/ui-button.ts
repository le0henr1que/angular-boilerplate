import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type ButtonSize, type ButtonVariant } from './ui-button.types';

/**
 * Button. Applied to a native <button> or <a>, to keep the browser's semantics and
 * accessibility (keyboard, focus, screen reader):
 *
 *   <button ui-button variant="outline" size="sm">Salvar</button>
 *   <a ui-button routerLink="/inicio">Início</a>
 */
@Component({
  selector: 'button[ui-button], a[ui-button]',
  template: '<ng-content />',
  styleUrl: './ui-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
})
export class UiButton {
  readonly variant = input<ButtonVariant>('default');
  readonly size = input<ButtonSize>('default');
}
