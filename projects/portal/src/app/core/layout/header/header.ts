import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UiBadge } from '@supermercado/ui/badge';
import { UiButton } from '@supermercado/ui/button';
import { UiHeaderImports } from '@supermercado/ui/header';
import { UiIcon } from '@supermercado/ui/icon';
import { UiSpinner } from '@supermercado/ui/spinner';
import { injectIsFetching } from '@tanstack/angular-query-experimental';
import { Auth } from '@core/auth/auth';
import { ROLE } from '@core/auth/auth.enums';
import { APP_CONFIG } from '@core/config/app-config.tokens';
import { injectFeatures } from '@core/config/feature-flags';
import { injectTheme } from '@core/theme/inject-theme';
import { ENVIRONMENT_LABEL, THEME_TOGGLE } from './header.constants';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, UiBadge, UiButton, UiHeaderImports, UiIcon, UiSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header ui-header>
      <a ui-header-brand routerLink="/">
        <ui-icon name="shopping-cart" class="brand-icon" />
        {{ appName }}
      </a>
      <!-- Outside production, makes clear which environment you are in (avoids testing "in prod"). -->
      @if (environment) {
        <span ui-badge variant="destructive" class="environment">{{ environment }}</span>
      }

      <nav ui-header-nav aria-label="Principal" class="navigation">
        @for (link of links(); track link.route) {
          <a
            ui-button
            variant="ghost"
            size="sm"
            [routerLink]="link.route"
            routerLinkActive="active"
            ariaCurrentWhenActive="page"
          >
            {{ link.label }}
          </a>
        }
      </nav>

      <div ui-header-actions>
        @if (auth.user(); as user) {
          <span class="user">{{ user.name }}</span>
          <button ui-button variant="outline" size="sm" type="button" (click)="auth.signOut()">
            Sair
          </button>
        }
        <!-- Global indicator: shows whenever ANY query is fetching data. -->
        @if (fetching() > 0) {
          <ui-spinner aria-label="Sincronizando dados" class="fetching" />
        }
        @let toggle = themeToggle[theme.theme()];
        <button
          ui-button
          variant="ghost"
          size="icon"
          type="button"
          [attr.aria-label]="toggle.label"
          (click)="theme.toggle()"
        >
          <ui-icon [name]="toggle.icon" />
        </button>
      </div>
    </header>
  `,
  styleUrl: './header.css',
})
export class AppHeader {
  readonly #config = inject(APP_CONFIG);
  protected readonly appName = this.#config.appName;
  /** Environment label; `null` in production (no badge). */
  protected readonly environment = ENVIRONMENT_LABEL[this.#config.environment];
  protected readonly theme = injectTheme();
  protected readonly themeToggle = THEME_TOGGLE;
  protected readonly fetching = injectIsFetching();
  protected readonly auth = inject(Auth);
  readonly #features = injectFeatures();

  /** The menu follows the same rules as the routes: flag off or no role = the link disappears. */
  protected readonly links = computed(() => {
    // With login on, no menu before signing in.
    if (this.auth.enabled && !this.auth.authenticated()) return [];
    return [
      { route: '/inicio', label: 'Início', visible: true },
      { route: '/produtos', label: 'Produtos', visible: true },
      { route: '/catalogo', label: 'Catálogo', visible: true },
      { route: '/ecossistema', label: 'Ecossistema', visible: true },
      { route: '/fornecedores', label: 'Fornecedores', visible: this.#features.suppliers },
      {
        route: '/admin',
        label: 'Admin',
        visible: this.#features.adminArea && this.auth.canAccess(ROLE.admin),
      },
    ].filter((link) => link.visible);
  });
}
