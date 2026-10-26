import { ChangeDetectionStrategy, Component } from '@angular/core';

/*
 * Trilha de navegação e suas partes. Cada parte é um atributo aplicado a um
 * elemento nativo; o separador "/" entre os itens é desenhado pelo CSS:
 *
 *   <nav aria-label="Trilha de navegação">
 *     <ol ui-breadcrumb>
 *       <li ui-breadcrumb-item><a ui-breadcrumb-link routerLink="/produtos">Produtos</a></li>
 *       <li ui-breadcrumb-item><span ui-breadcrumb-page>Detalhe</span></li>
 *     </ol>
 *   </nav>
 */

@Component({
  selector: '[ui-breadcrumb]',
  template: '<ng-content />',
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: calc(var(--space) * 1.5);
      margin: 0;
      padding: 0;
      list-style: none;
      color: var(--muted-foreground);
      font-size: var(--text-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiBreadcrumb {}

@Component({
  selector: '[ui-breadcrumb-item]',
  template: '<ng-content />',
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: calc(var(--space) * 1.5);
    }
    :host:not(:first-child)::before {
      content: '/';
      color: var(--muted-foreground);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiBreadcrumbItem {}

@Component({
  selector: '[ui-breadcrumb-link]',
  template: '<ng-content />',
  styles: `
    :host {
      color: inherit;
      text-decoration: none;
      transition: color 150ms;
    }
    :host:hover {
      color: var(--foreground);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiBreadcrumbLink {}

/** Item atual: não é link e é anunciado como a página atual. */
@Component({
  selector: '[ui-breadcrumb-page]',
  template: '<ng-content />',
  styles: `
    :host {
      color: var(--foreground);
      font-weight: 500;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-current': 'page' },
})
export class UiBreadcrumbPage {}
