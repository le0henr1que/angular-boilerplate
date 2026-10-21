import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';

export type AlertVariant = 'default' | 'destructive';

/*
 *   <div ui-alert variant="destructive">
 *     <ui-icon name="circle-alert" />
 *     <h2 ui-alert-title>Algo deu errado</h2>
 *     <p ui-alert-description>Tente de novo.</p>
 *   </div>
 *
 * O alerta posiciona o ícone que vem de fora (conteúdo projetado). O estilo normal de um
 * componente não alcança conteúdo projetado, por isso aqui o encapsulamento é desligado e
 * TODA regra começa com [ui-alert], para não vazar para o resto da página.
 */
@Component({
  selector: '[ui-alert]',
  template: '<ng-content />',
  styles: `
    [ui-alert] {
      position: relative;
      display: grid;
      grid-template-columns: auto 1fr;
      column-gap: calc(var(--space) * 2.5);
      row-gap: calc(var(--space) * 0.5);
      padding: calc(var(--space) * 2.5) calc(var(--space) * 3);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--card);
      color: var(--card-foreground);
      font-size: var(--text-sm);
    }
    [ui-alert] > ui-icon {
      grid-row: 1 / span 2;
      margin-top: 0.125rem;
      font-size: 1rem;
    }
    [ui-alert] > :not(ui-icon) {
      grid-column: 2;
    }
    [ui-alert][data-variant='destructive'] {
      color: var(--destructive);
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'alert',
    '[attr.data-variant]': 'variant()',
  },
})
export class UiAlert {
  readonly variant = input<AlertVariant>('default');
}

@Component({
  selector: '[ui-alert-title]',
  template: '<ng-content />',
  styles: `
    :host {
      font-size: var(--text-sm);
      font-weight: 500;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiAlertTitle {}

@Component({
  selector: '[ui-alert-description]',
  template: '<ng-content />',
  styles: `
    :host {
      display: block;
      color: var(--muted-foreground);
      font-size: var(--text-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiAlertDescription {}
