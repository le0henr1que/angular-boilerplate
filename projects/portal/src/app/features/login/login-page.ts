import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Auth } from '@core/auth/auth';
import { RETURN_TO_PARAM } from '@core/auth/auth.constants';
import { MOCK_PERSONAS } from '@core/auth/gateways/mock-personas';
import { DEFAULT_DESTINATION } from '@core/auth/auth.constants';
import { UiButton } from '@supermercado/ui/button';
import { UiCardImports } from '@supermercado/ui/card';

/**
 * SIMULATED login: only exists in mock mode (development), to pick a test user.
 * In production (bff) the /login route doesn't exist: the app sends straight to Microsoft.
 */
@Component({
  selector: 'app-login-page',
  imports: [UiButton, UiCardImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page narrow">
      <article ui-card>
        <div ui-card-header>
          <h1 ui-card-title>Entrar</h1>
          <p ui-card-description>Login simulado (desenvolvimento): escolha um usuário de teste.</p>
        </div>

        <div ui-card-content class="options">
          @for (persona of personas; track persona.id) {
            <button
              ui-button
              variant="outline"
              type="button"
              class="persona"
              [disabled]="signingIn()"
              (click)="signIn(persona.id)"
            >
              <strong>{{ persona.user.name }}</strong>
              <small>{{ persona.description }}</small>
            </button>
          }
        </div>
      </article>
    </section>
  `,
  styles: `
    .page {
      padding-top: 4rem;
    }
    .options {
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
  protected readonly personas = MOCK_PERSONAS;
  protected readonly signingIn = signal(false);
  readonly #auth = inject(Auth);
  readonly #route = inject(ActivatedRoute);

  protected async signIn(persona: string): Promise<void> {
    this.signingIn.set(true);
    try {
      await this.#auth.signIn(this.#returnTo(), persona);
    } finally {
      this.signingIn.set(false);
    }
  }

  /** ?voltarPara=/produtos/123, set by the guards. */
  #returnTo(): string {
    return this.#route.snapshot.queryParamMap.get(RETURN_TO_PARAM) ?? DEFAULT_DESTINATION;
  }
}
