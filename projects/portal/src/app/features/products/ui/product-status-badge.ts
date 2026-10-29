import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { UiBadge } from '@supermercado/ui/badge';
import { STATUS_BADGE_VARIANT, STATUS_LABEL } from '../models/product.constants';
import { type ProductStatus } from '../models/product.enums';

/** Colored status tag. Presentational component: only receives data through input(). */
@Component({
  selector: 'app-product-status-badge',
  imports: [UiBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span ui-badge [variant]="variant()">{{ label() }}</span>`,
})
export class ProductStatusBadge {
  readonly status = input.required<ProductStatus>();

  protected readonly variant = computed(() => STATUS_BADGE_VARIANT[this.status()]);
  protected readonly label = computed(() => STATUS_LABEL[this.status()]);
}
