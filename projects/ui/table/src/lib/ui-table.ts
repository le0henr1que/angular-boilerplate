import { ChangeDetectionStrategy, Component } from '@angular/core';

/*
 * Tabela nativa (<table>) com visual próprio. Cada parte se estiliza sozinha:
 *
 *   <div ui-table-container>
 *     <table ui-table>
 *       <thead ui-thead><tr ui-tr><th ui-th>Nome</th></tr></thead>
 *       <tbody ui-tbody><tr ui-tr><td ui-td>Ana</td></tr></tbody>
 *     </table>
 *   </div>
 */

@Component({
  selector: '[ui-table-container]',
  template: '<ng-content />',
  styles: `
    :host {
      display: block;
      width: 100%;
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTableContainer {}

@Component({
  selector: 'table[ui-table]',
  template: '<ng-content />',
  styles: `
    :host {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--text-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTable {}

@Component({
  selector: 'thead[ui-thead]',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTHead {}

@Component({
  selector: 'tbody[ui-tbody]',
  template: '<ng-content />',
  styles: `
    :host {
      transition: opacity var(--transition);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTBody {}

@Component({
  selector: 'tr[ui-tr]',
  template: '<ng-content />',
  styles: `
    :host {
      border-bottom: 1px solid var(--border);
      transition: background-color var(--transition);
    }
    :host(:last-child) {
      border-bottom: 0;
    }
    :host(:hover) {
      background: color-mix(in oklch, var(--muted) 50%, transparent);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTr {}

@Component({
  selector: 'th[ui-th]',
  template: '<ng-content />',
  styles: `
    :host {
      height: 2.5rem;
      padding: 0 calc(var(--space) * 2);
      font-weight: 500;
      text-align: start;
      white-space: nowrap;
      vertical-align: middle;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTh {}

@Component({
  selector: 'td[ui-td]',
  template: '<ng-content />',
  styles: `
    :host {
      padding: calc(var(--space) * 2);
      vertical-align: middle;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTd {}
