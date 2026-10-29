import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { UiBadge } from '@supermercado/ui/badge';
import { PARTNER_TYPE_BADGE_VARIANT, PARTNER_TYPE_LABEL } from '../models/ecosystem.constants';
import { type PartnerType } from '../models/ecosystem.enums';

/** Partner type tag. Presentational component: only receives data through input(). */
@Component({
  selector: 'app-partner-type-badge',
  imports: [UiBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span ui-badge [variant]="variant()">{{ label() }}</span>`,
})
export class PartnerTypeBadge {
  readonly type = input.required<PartnerType>();

  protected readonly variant = computed(() => PARTNER_TYPE_BADGE_VARIANT[this.type()]);
  protected readonly label = computed(() => PARTNER_TYPE_LABEL[this.type()]);
}
