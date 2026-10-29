import { ChangeDetectionStrategy, Component } from '@angular/core';

/*
 * Sticky top header and its parts. Each part is an attribute applied to a
 * native element, so you pick the right tag (header, a, nav, div…):
 *
 *   <header ui-header>
 *     <a ui-header-brand routerLink="/">Marca</a>
 *     <nav ui-header-nav aria-label="Principal">…</nav>
 *     <div ui-header-actions>…</div>
 *   </header>
 */

@Component({
  selector: '[ui-header]',
  template: '<div class="content"><ng-content /></div>',
  styles: `
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 10;
      border-bottom: 1px solid var(--border);
      background: color-mix(in oklch, var(--background) 90%, transparent);
      backdrop-filter: blur(8px);
    }
    .content {
      display: flex;
      align-items: center;
      gap: calc(var(--space) * 6);
      max-width: 72rem;
      height: 3.5rem;
      margin: 0 auto;
      padding: 0 calc(var(--space) * 4);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiHeader {}

@Component({
  selector: '[ui-header-brand]',
  template: '<ng-content />',
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: calc(var(--space) * 2);
      font-weight: 600;
      text-decoration: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiHeaderBrand {}

@Component({
  selector: '[ui-header-nav]',
  template: '<ng-content />',
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: calc(var(--space) * 1);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiHeaderNav {}

@Component({
  selector: '[ui-header-actions]',
  template: '<ng-content />',
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: calc(var(--space) * 2);
      margin-left: auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiHeaderActions {}
