import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="rodape">
      <span>{{ config.appName }}</span>
      <!-- Versão do package.json: ajuda a saber o que está publicado ao reportar um problema. -->
      <span class="versao">v{{ config.version }}</span>
    </footer>
  `,
  styles: `
    :host {
      display: block;
      border-top: 1px solid var(--border);
    }
    .rodape {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: calc(var(--space) * 4);
      max-width: 72rem;
      margin: 0 auto;
      padding: calc(var(--space) * 4);
      color: var(--muted-foreground);
      font-size: var(--text-xs);
    }
    .versao {
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class AppFooter {
  protected readonly config = inject(APP_CONFIG);
}
