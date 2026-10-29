import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config.tokens';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <span>{{ config.appName }}</span>
      <!-- package.json version: helps to know what is deployed when reporting a problem. -->
      <span class="version">v{{ config.version }}</span>
    </footer>
  `,
  styles: `
    :host {
      display: block;
      border-top: 1px solid var(--border);
    }
    .footer {
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
    .version {
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class AppFooter {
  protected readonly config = inject(APP_CONFIG);
}
