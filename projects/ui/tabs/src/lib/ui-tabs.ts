import { ChangeDetectionStrategy, Component } from '@angular/core';

/*
 * Underlined tabs. Each part is an attribute applied to a native element; the active tab is the
 * one marked with aria-current="page" (navigation) or aria-selected="true" (tab panel):
 *
 *   <nav ui-tabs aria-label="Cadastros">
 *     <a ui-tab routerLink="/fornecedores" routerLinkActive ariaCurrentWhenActive="page"
 *        [routerLinkActiveOptions]="{ exact: true }">Fornecedores</a>
 *     <a ui-tab routerLink="/fornecedores/categorias" routerLinkActive
 *        ariaCurrentWhenActive="page">Categorias</a>
 *   </nav>
 *
 * The library doesn't know the router: with routerLinkActive the active state comes for free.
 */

@Component({
  selector: '[ui-tabs]',
  template: '<ng-content />',
  styles: `
    :host {
      display: flex;
      gap: calc(var(--space) * 2);
      overflow-x: auto;
      /* Line drawn inside the box: the active tab's border covers it without overflowing. */
      box-shadow: inset 0 -1px 0 var(--border);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTabs {}

@Component({
  selector: '[ui-tab]',
  template: '<ng-content />',
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: calc(var(--space) * 2);
      padding: calc(var(--space) * 2) calc(var(--space) * 3);
      border: 0;
      border-bottom: 2px solid transparent;
      background: none;
      color: var(--muted-foreground);
      font: inherit;
      font-size: var(--text-sm);
      font-weight: 500;
      white-space: nowrap;
      text-decoration: none;
      cursor: pointer;
      transition:
        color var(--transition),
        border-color var(--transition);
    }
    :host(:hover) {
      color: var(--foreground);
    }
    :host([aria-current='page']),
    :host([aria-selected='true']) {
      border-bottom-color: var(--primary);
      color: var(--foreground);
    }
    :host(:focus-visible) {
      outline: 2px solid var(--ring);
      outline-offset: -2px;
      border-radius: var(--radius-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTab {}
