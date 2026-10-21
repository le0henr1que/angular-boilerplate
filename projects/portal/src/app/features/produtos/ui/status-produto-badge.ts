import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { type BadgeVariant, UiBadge } from '@supermercado/ui/badge';
import { ROTULO_STATUS, type StatusProduto } from '../models/produto.model';

const VARIANTE: Record<StatusProduto, BadgeVariant> = {
  disponivel: 'default',
  baixo: 'secondary',
  esgotado: 'destructive',
};

/** Etiqueta colorida do status. Componente de apresentação: só recebe dados por input(). */
@Component({
  selector: 'app-status-produto-badge',
  imports: [UiBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span ui-badge [variant]="variante()">{{ rotulo() }}</span>`,
})
export class StatusProdutoBadge {
  readonly status = input.required<StatusProduto>();

  protected readonly variante = computed(() => VARIANTE[this.status()]);
  protected readonly rotulo = computed(() => ROTULO_STATUS[this.status()]);
}
