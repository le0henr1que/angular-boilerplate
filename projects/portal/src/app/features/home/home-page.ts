import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_CONFIG } from '@core/config/app-config.tokens';
import {
  EMPTY_FILTERS,
  injectProducts,
  PRODUCT_STATUSES,
  type ProductStatus,
  STATUS_LABEL,
} from '@features/products';
import { UiButton } from '@supermercado/ui/button';
import { UiCardImports } from '@supermercado/ui/card';
import { UiIcon } from '@supermercado/ui/icon';
import { UiSkeleton } from '@supermercado/ui/skeleton';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, UiButton, UiCardImports, UiIcon, UiSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <header class="page-title">
        <h1>Bem-vindo ao {{ appName }}</h1>
        <p>Resumo do estoque de produtos.</p>
      </header>

      <div class="summary">
        @for (card of summary(); track card.label) {
          <article ui-card>
            <div ui-card-header>
              <p ui-card-description>{{ card.label }}</p>
              @if (products.isPending()) {
                <ui-skeleton class="loading-number" />
              } @else {
                <p ui-card-title class="number">{{ card.total }}</p>
              }
            </div>
          </article>
        }
      </div>

      <div class="actions">
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
    .page {
      align-items: flex-start;
      gap: 2rem;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
      gap: 1rem;
      width: 100%;
    }
    .number {
      font-size: var(--text-3xl);
      font-variant-numeric: tabular-nums;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .loading-number {
      width: 4rem;
      height: 2rem;
    }
  `,
})
export default class HomePage {
  protected readonly appName = inject(APP_CONFIG).appName;

  // Same cache key as the unfiltered list: going from here to "Produtos" shows the table
  // right away, without a new API call (and vice versa).
  protected readonly products = injectProducts(() => EMPTY_FILTERS);

  protected readonly summary = computed(() => {
    const list = this.products.data() ?? [];
    const count = (status: ProductStatus) => list.filter((p) => p.status === status).length;
    return [
      { label: 'Total', total: list.length },
      ...PRODUCT_STATUSES.map((status) => ({ label: STATUS_LABEL[status], total: count(status) })),
    ];
  });
}
