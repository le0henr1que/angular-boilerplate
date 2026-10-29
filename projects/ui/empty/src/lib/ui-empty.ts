import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type EmptyMediaVariant } from './ui-empty.types';

/*
 * Empty state ("nothing found", "page doesn't exist"…):
 *
 *   <div ui-empty>
 *     <div ui-empty-header>
 *       <div ui-empty-media variant="icon"><ui-icon name="search-x" /></div>
 *       <h2 ui-empty-title>Nada por aqui</h2>
 *       <p ui-empty-description>Tente outro termo.</p>
 *     </div>
 *     <div ui-empty-content><button ui-button>Limpar</button></div>
 *   </div>
 */

@Component({
  selector: '[ui-empty]',
  template: '<ng-content />',
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: calc(var(--space) * 4);
      padding: calc(var(--space) * 12) calc(var(--space) * 6);
      text-align: center;
      text-wrap: balance;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiEmpty {}

@Component({
  selector: '[ui-empty-header]',
  template: '<ng-content />',
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: calc(var(--space) * 2);
      max-width: 24rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiEmptyHeader {}

@Component({
  selector: '[ui-empty-media]',
  template: '<ng-content />',
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: calc(var(--space) * 2);
    }
    :host([data-variant='icon']) {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--radius-lg);
      background: var(--muted);
      color: var(--foreground);
      font-size: 1.25rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-variant]': 'variant()' },
})
export class UiEmptyMedia {
  readonly variant = input<EmptyMediaVariant>('default');
}

@Component({
  selector: '[ui-empty-title]',
  template: '<ng-content />',
  styles: `
    :host {
      font-size: var(--text-lg);
      font-weight: 500;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiEmptyTitle {}

@Component({
  selector: '[ui-empty-description]',
  template: '<ng-content />',
  styles: `
    :host {
      color: var(--muted-foreground);
      font-size: var(--text-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiEmptyDescription {}

@Component({
  selector: '[ui-empty-content]',
  template: '<ng-content />',
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: calc(var(--space) * 2.5);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiEmptyContent {}
