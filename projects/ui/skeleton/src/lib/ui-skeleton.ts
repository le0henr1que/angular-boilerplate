import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Bloco cinza pulsando, no lugar de um conteúdo que ainda está carregando.
 * Por padrão ocupa a largura toda com 1rem de altura; ajuste com o CSS de quem usa:
 *   <ui-skeleton class="titulo" />   →   .titulo { height: 2rem; width: 12rem; }
 */
@Component({
  selector: 'ui-skeleton',
  template: '',
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 1rem;
      border-radius: var(--radius-md);
      background: var(--muted);
      animation: pulsar 2s ease-in-out infinite;
    }
    @keyframes pulsar {
      50% {
        opacity: 0.5;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      :host {
        animation: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class UiSkeleton {}
