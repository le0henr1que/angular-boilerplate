import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_CONFIG } from '@core/config/app-config';
import {
  FILTROS_VAZIOS,
  injectProdutos,
  ROTULO_STATUS,
  STATUS_PRODUTO,
  type StatusProduto,
} from '@features/produtos';
import { UiButton } from '@supermercado/ui/button';
import { UiCardImports } from '@supermercado/ui/card';
import { UiIcon } from '@supermercado/ui/icon';
import { UiSkeleton } from '@supermercado/ui/skeleton';

@Component({
  selector: 'app-inicio-page',
  imports: [RouterLink, UiButton, UiCardImports, UiIcon, UiSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pagina">
      <header class="titulo-pagina">
        <h1>Bem-vindo ao {{ appName }}</h1>
        <p>Resumo do estoque de produtos.</p>
      </header>

      <div class="resumo">
        @for (card of resumo(); track card.rotulo) {
          <article ui-card>
            <div ui-card-header>
              <p ui-card-description>{{ card.rotulo }}</p>
              @if (produtos.isPending()) {
                <ui-skeleton class="numero-carregando" />
              } @else {
                <p ui-card-title class="numero">{{ card.total }}</p>
              }
            </div>
          </article>
        }
      </div>

      <div class="acoes">
        <a ui-button routerLink="/produtos">
          Ver todos os produtos
          <ui-icon name="arrow-right" />
        </a>
        <a ui-button variant="outline" routerLink="/catalogo">
          Ver catálogo
          <ui-icon name="arrow-right" />
        </a>
      </div>
    </section>
  `,
  styles: `
    .pagina {
      align-items: flex-start;
      gap: 2rem;
    }
    .resumo {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
      gap: 1rem;
      width: 100%;
    }
    .numero {
      font-size: var(--text-3xl);
      font-variant-numeric: tabular-nums;
    }
    .acoes {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .numero-carregando {
      width: 4rem;
      height: 2rem;
    }
  `,
})
export default class InicioPage {
  protected readonly appName = inject(APP_CONFIG).appName;

  // Mesma chave de cache da lista sem filtros: se você vier daqui para "Produtos",
  // a tabela aparece na hora, sem nova chamada à API (e vice-versa).
  protected readonly produtos = injectProdutos(() => FILTROS_VAZIOS);

  protected readonly resumo = computed(() => {
    const lista = this.produtos.data() ?? [];
    const contar = (status: StatusProduto) => lista.filter((a) => a.status === status).length;
    return [
      { rotulo: 'Total', total: lista.length },
      ...STATUS_PRODUTO.map((status) => ({ rotulo: ROTULO_STATUS[status], total: contar(status) })),
    ];
  });
}
