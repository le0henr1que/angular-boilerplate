import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

/**
 * Botão. Aplica-se a um <button> ou <a> nativo, para manter a semântica e a
 * acessibilidade do navegador (teclado, foco, leitor de tela):
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
