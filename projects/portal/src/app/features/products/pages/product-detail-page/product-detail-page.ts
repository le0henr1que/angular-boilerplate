import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiAlertImports } from '@supermercado/ui/alert';
import { UiButton } from '@supermercado/ui/button';
import { UiCardImports } from '@supermercado/ui/card';
import { UiEmptyImports } from '@supermercado/ui/empty';
import { UiIcon } from '@supermercado/ui/icon';
import { UiSkeleton } from '@supermercado/ui/skeleton';
import { injectProduct } from '../../data-access/products.queries';
import { ProductStatusBadge } from '../../ui/product-status-badge';
import { NOT_FOUND_STATUS } from './product-detail-page.constants';

@Component({
  selector: 'app-product-detail-page',
  imports: [
    RouterLink,
    DatePipe,
    CurrencyPipe,
    UiAlertImports,
    UiButton,
    UiCardImports,
    UiEmptyImports,
    UiIcon,
    UiSkeleton,
    ProductStatusBadge,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-detail-page.html',
  styleUrl: './product-detail-page.scss',
})
export default class ProductDetailPage {
  /** Comes from the route's :code parameter (withComponentInputBinding in app.config.ts). */
  readonly code = input.required<string>();

  // If you hovered the row in the list, this is already in the cache and opens right away.
  protected readonly product = injectProduct(this.code);

  protected readonly notFound = computed(() => {
    const error = this.product.error();
    return error instanceof HttpErrorResponse && error.status === NOT_FOUND_STATUS;
  });
}
