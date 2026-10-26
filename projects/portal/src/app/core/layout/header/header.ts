import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UiButton } from '@supermercado/ui/button';
import { UiHeaderImports } from '@supermercado/ui/header';
import { UiIcon } from '@supermercado/ui/icon';
import { UiSpinner } from '@supermercado/ui/spinner';
import { injectIsFetching } from '@tanstack/angular-query-experimental';
import { Auth } from '@core/auth/auth';
import { APP_CONFIG } from '@core/config/app-config';
import { injectFeatures } from '@core/config/feature-flags';
import { injectTema } from '@core/theme/inject-tema';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, UiButton, UiHeaderImports, UiIcon, UiSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header ui-header>
      <a ui-header-brand routerLink="/">
        <ui-icon name="shopping-cart" class="marca-icone" />
        {{ appName }}
      </a>

      <nav ui-header-nav aria-label="Principal" class="navegacao">
        @for (link of links(); track link.rota) {
          <a
            ui-button
            variant="ghost"
            size="sm"
            [routerLink]="link.rota"
            routerLinkActive="ativo"
            ariaCurrentWhenActive="page"
          >
            {{ link.rotulo }}
          </a>
        }
      </nav>

      <div ui-header-actions>
        @if (auth.usuario(); as usuario) {
          <span class="usuario">{{ usuario.nome }}</span>
          <button ui-button variant="outline" size="sm" type="button" (click)="auth.sair()">
            Sair
          </button>
        }
        <!-- Indicador global: aparece sempre que QUALQUER query está buscando dados. -->
        @if (buscando() > 0) {
          <ui-spinner aria-label="Sincronizando dados" class="carregando" />
        }
        <button
          ui-button
          variant="ghost"
          size="icon"
          type="button"
          [attr.aria-label]="tema.tema() === 'escuro' ? 'Usar tema claro' : 'Usar tema escuro'"
          (click)="tema.alternar()"
        >
          <ui-icon [name]="tema.tema() === 'escuro' ? 'sun' : 'moon'" />
        </button>
      </div>
    </header>
  `,
  styleUrl: './header.css',
})
export class AppHeader {
  protected readonly appName = inject(APP_CONFIG).appName;
  protected readonly tema = injectTema();
  protected readonly buscando = injectIsFetching();
  protected readonly auth = inject(Auth);
  readonly #features = injectFeatures();

  /** Menu segue as mesmas regras das rotas: flag desligada ou sem papel = link some. */
  protected readonly links = computed(() => {
    // Com login ligado, nada de menu antes de entrar.
    if (this.auth.ativa && !this.auth.autenticado()) return [];
    return [
      { rota: '/inicio', rotulo: 'Início', visivel: true },
      { rota: '/produtos', rotulo: 'Produtos', visivel: true },
      { rota: '/catalogo', rotulo: 'Catálogo', visivel: true },
      { rota: '/fornecedores', rotulo: 'Fornecedores', visivel: this.#features.fornecedores },
      {
        rota: '/admin',
        rotulo: 'Admin',
        visivel: this.#features.areaAdmin && this.auth.podeAcessar('admin'),
      },
    ].filter((link) => link.visivel);
  });
}
