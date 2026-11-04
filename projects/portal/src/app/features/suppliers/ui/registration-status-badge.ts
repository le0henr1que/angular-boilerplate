import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { UiBadge } from '@supermercado/ui/badge';
import {
  REGISTRATION_STATUS_BADGE_VARIANT,
  REGISTRATION_STATUS_LABEL,
} from '../models/registration.constants';
import { type RegistrationStatus } from '../models/registration.enums';

/** Registration status tag. Presentational component: only receives data through input(). */
@Component({
  selector: 'app-registration-status-badge',
  imports: [UiBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span ui-badge [variant]="variant()">{{ label() }}</span>`,
})
export class RegistrationStatusBadge {
  readonly status = input.required<RegistrationStatus>();

  protected readonly variant = computed(() => REGISTRATION_STATUS_BADGE_VARIANT[this.status()]);
  protected readonly label = computed(() => REGISTRATION_STATUS_LABEL[this.status()]);
}
