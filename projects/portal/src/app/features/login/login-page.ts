import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { Auth } from '@core/auth/auth';
import { PERSONAS_MOCK } from '@core/auth/gateways/personas-mock';
import { UiButton } from '@supermercado/ui/button';
import { UiCardImports } from '@supermercado/ui/card';

/**
 * Login SIMULADO: só existe no modo mock (desenvolvimento), para escolher um usuário de teste.
 * Em produção (bff) a rota /login não existe: o app manda direto para a Microsoft.
 */
@Component({
  selector: 'app-login-page',
  imports: [UiButton, UiCardImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pagina estreita">
      <article ui-card>
        <div ui-card-header>
          <h1 ui-card-title>Entrar</h1>
          <p ui-card-description>Login simulado (desenvolvimento): escolha um usuário de teste.</p>
        </div>

        <div ui-card-content class="opcoes">
          @for (persona of personas; track persona.id) {
            <button
              ui-button
              variant="outline"
              type="button"
              class="persona"
              [disabled]="entrando()"
              (click)="entrar(persona.id)"
            >
              <strong>{{ persona.usuario.nome }}</strong>
              <small>{{ persona.descricao }}</small>
            </button>
          }
        </div>
      </article>
    </section>
  `,
  styles: `
    .pagina {
      padding-top: 4rem;
    }
    .opcoes {
      display: grid;
      gap: 0.5rem;
    }
    .persona {
      flex-direction: column;
      align-items: flex-start;
      height: auto;
      padding-block: 0.5rem;
    }
    .persona small {
      color: var(--muted-foreground);
      font-weight: 400;
    }
  `,
})
export default class LoginPage {
  /** ?voltarPara=/produtos/123 (posto pelos guards) chega aqui como input. */
  readonly voltarPara = input<string>();

  protected readonly personas = PERSONAS_MOCK;
  protected readonly entrando = signal(false);
  readonly #auth = inject(Auth);

  protected async entrar(persona: string): Promise<void> {
    this.entrando.set(true);
    try {
      await this.#auth.entrar(this.voltarPara() ?? '/inicio', persona);
    } finally {
      this.entrando.set(false);
    }
  }
}
