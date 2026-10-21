import { ChangeDetectionStrategy, Component } from '@angular/core';

/*
 * Cartão e suas partes. Cada parte é um atributo aplicado a um elemento nativo,
 * para você escolher a tag certa (article, h2, p…):
 *
 *   <article ui-card>
 *     <header ui-card-header>
 *       <h2 ui-card-title>Título</h2>
 *       <p ui-card-description>Descrição</p>
 *       <div ui-card-action>…</div>
 *     </header>
 *     <div ui-card-content>…</div>
 *     <footer ui-card-footer>…</footer>
 *   </article>
 */

@Component({
  selector: '[ui-card]',
  template: '<ng-content />',
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: calc(var(--space) * 6);
      padding: calc(var(--space) * 6) 0;
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--card);
      color: var(--card-foreground);
      box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCard {}

@Component({
  selector: '[ui-card-header]',
  template: '<ng-content />',
  styles: `
    :host {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: start;
      gap: calc(var(--space) * 1.5);
      padding: 0 calc(var(--space) * 6);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCardHeader {}

@Component({
  selector: '[ui-card-title]',
  template: '<ng-content />',
  styles: `
    :host {
      grid-column: 1;
      font-size: var(--text-base);
      font-weight: 600;
      line-height: 1.2;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCardTitle {}

@Component({
  selector: '[ui-card-description]',
  template: '<ng-content />',
  styles: `
    :host {
      grid-column: 1;
      color: var(--muted-foreground);
      font-size: var(--text-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCardDescription {}

@Component({
  selector: '[ui-card-action]',
  template: '<ng-content />',
  styles: `
    :host {
      grid-column: 2;
      grid-row: 1 / span 2;
      justify-self: end;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCardAction {}

@Component({
  selector: '[ui-card-content]',
  template: '<ng-content />',
  styles: `
    :host {
      display: block;
      padding: 0 calc(var(--space) * 6);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCardContent {}

@Component({
  selector: '[ui-card-footer]',
  template: '<ng-content />',
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: calc(var(--space) * 2);
      padding: 0 calc(var(--space) * 6);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCardFooter {}
