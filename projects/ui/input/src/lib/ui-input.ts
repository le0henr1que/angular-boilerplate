import { ChangeDetectionStrategy, Component } from '@angular/core';

/*
 * Campo de texto simples:
 *   <input ui-input id="nome" />
 *
 * Campo com ícone ou texto ao lado (o grupo desenha a borda e o foco):
 *   <div ui-input-group>
 *     <span ui-input-group-addon><ui-icon name="search" /></span>
 *     <input ui-input-group-input id="busca" type="search" />
 *   </div>
 */

@Component({
  selector: 'input[ui-input], textarea[ui-input]',
  template: '',
  styles: `
    :host {
      width: 100%;
      min-width: 0;
      height: 2rem;
      padding: 0 calc(var(--space) * 2.5);
      border: 1px solid var(--input);
      border-radius: var(--radius-lg);
      background: transparent;
      color: inherit;
      font: inherit;
      font-size: var(--text-sm);
      transition:
        border-color var(--transition),
        box-shadow var(--transition);
    }
    :host::placeholder {
      color: var(--muted-foreground);
    }
    :host(:focus-visible) {
      outline: none;
      border-color: var(--ring);
      box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent);
    }
    :host(:disabled) {
      opacity: 0.5;
      cursor: not-allowed;
    }
    :host([aria-invalid='true']) {
      border-color: var(--destructive);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiInput {}

@Component({
  selector: '[ui-input-group]',
  template: '<ng-content />',
  styles: `
    :host {
      display: flex;
      align-items: center;
      width: 100%;
      height: 2rem;
      border: 1px solid var(--input);
      border-radius: var(--radius-lg);
      transition:
        border-color var(--transition),
        box-shadow var(--transition);
    }
    :host(:focus-within) {
      border-color: var(--ring);
      box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'group' },
})
export class UiInputGroup {}

@Component({
  selector: '[ui-input-group-addon]',
  template: '<ng-content />',
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: calc(var(--space) * 2);
      padding-left: calc(var(--space) * 2.5);
      color: var(--muted-foreground);
      font-size: var(--text-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiInputGroupAddon {}

@Component({
  selector: 'input[ui-input-group-input]',
  template: '',
  styles: `
    :host {
      flex: 1;
      min-width: 0;
      height: 100%;
      padding: 0 calc(var(--space) * 2.5);
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      font-size: var(--text-sm);
      outline: none;
    }
    :host::placeholder {
      color: var(--muted-foreground);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiInputGroupInput {}
