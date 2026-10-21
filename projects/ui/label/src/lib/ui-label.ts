import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Rótulo de campo: <label ui-label for="email">E-mail</label> */
@Component({
  selector: 'label[ui-label]',
  template: '<ng-content />',
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: calc(var(--space) * 2);
      font-size: var(--text-sm);
      font-weight: 500;
      line-height: 1;
      user-select: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiLabel {}
