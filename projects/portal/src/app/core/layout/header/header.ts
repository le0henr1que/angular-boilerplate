import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UiButton } from '@supermercado/ui/button';
import { UiIcon } from '@supermercado/ui/icon';
import { UiSpinner } from '@supermercado/ui/spinner';
import { injectIsFetching } from '@tanstack/angular-query-experimental';
import { Auth } from '@core/auth/auth';
import { APP_CONFIG } from '@core/config/app-config';
import { injectFeatures } from '@core/config/feature-flags';
import { injectTema } from '@core/theme/inject-tema';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, UiButton, UiIcon, UiSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="cabecalho">
      <div class="conteudo">
        <a routerLink="/" class="marca">
          <ui-icon name="shopping-cart" class="marca-icone" />
          {{ appName }}
        </a>

        <nav aria-label="Principal" class="navegacao">
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

        <div class="acoes">
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
      </div>
    </header>
  `,
  styles: `
    .cabecalho {
      position: sticky;
      top: 0;
      z-index: 10;
      border-bottom: 1px solid var(--border);
      background: color-mix(in oklch, var(--background) 90%, transparent);
      backdrop-filter: blur(8px);
    }
    .conteudo {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      max-width: 72rem;
      height: 3.5rem;
      margin: 0 auto;
      padding: 0 1rem;
    }
    .marca {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      text-decoration: none;
    }
    .marca-icone {
      font-size: var(--text-xl);
    }
    .navegacao {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    /* Mais específico que o estilo do botão "ghost", para o link ativo ganhar o fundo. */
    .navegacao .ativo {
      background: var(--muted);
      color: var(--foreground);
    }
    .acoes {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-left: auto;
    }
    .usuario {
      font-size: var(--text-sm);
      color: var(--muted-foreground);
    }
    .carregando {
      color: var(--muted-foreground);
    }
  `,
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
      { rota: '/fornecedores', rotulo: 'Fornecedores', visivel: this.#features.fornecedores },
      {
        rota: '/admin',
        rotulo: 'Admin',
        visivel: this.#features.areaAdmin && this.auth.podeAcessar('admin'),
      },
    ].filter((link) => link.visivel);
  });
}
