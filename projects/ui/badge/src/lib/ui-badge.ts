import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type BadgeVariant } from './ui-badge.types';

/** Short tag: <span ui-badge variant="secondary">Estoque baixo</span> */
@Component({
  selector: '[ui-badge]',
  template: '<ng-content />',
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--space);
      height: 1.25rem;
      padding: 0 calc(var(--space) * 2);
      border: 1px solid transparent;
      border-radius: 999px;
      background: var(--primary);
      color: var(--primary-foreground);
      font-size: var(--text-xs);
      font-weight: 500;
      white-space: nowrap;
    }
    :host([data-variant='secondary']) {
      background: var(--secondary);
      color: var(--secondary-foreground);
    }
    :host([data-variant='destructive']) {
      background: color-mix(in oklch, var(--destructive) 10%, transparent);
      color: var(--destructive);
    }
    :host([data-variant='outline']) {
      border-color: var(--border);
      background: transparent;
      color: var(--foreground);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-variant]': 'variant()' },
})
export class UiBadge {
  readonly variant = input<BadgeVariant>('default');
}
