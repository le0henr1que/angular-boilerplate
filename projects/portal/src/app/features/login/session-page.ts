import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Auth } from '@core/auth/auth';
import { RETURN_TO_PARAM } from '@core/auth/auth.constants';
import { DEFAULT_DESTINATION } from '@core/auth/auth.constants';
import { UiButton } from '@supermercado/ui/button';
import { UiEmptyImports } from '@supermercado/ui/empty';
import { SESSION_TEXTS } from './session.constants';
import { type SessionReason } from './session.enums';

/**
 * Public session pages (no login):
 * - /saiu: where the backend redirects after logout. Without it, going back to a signed-in
 *   screen would send straight to Microsoft, which would sign in again right away.
 * - /erro-login: the app came back from login without a session (backend problem). Breaks the loop.
 */
@Component({
  selector: 'app-session-page',
  imports: [UiButton, UiEmptyImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page narrow">
      <div ui-empty>
        <div ui-empty-header>
          <h1 ui-empty-title>{{ texts[reason()].title }}</h1>
          <p ui-empty-description>{{ texts[reason()].description }}</p>
        </div>
        <div ui-empty-content>
          <button ui-button type="button" [disabled]="signingIn()" (click)="signIn()">
            {{ texts[reason()].action }}
          </button>
        </div>
      </div>
    </section>
  `,
  styles: `
    .page {
      padding-top: 4rem;
    }
  `,
})
export default class SessionPage {
  /** Comes from the route's `data`. */
  readonly reason = input.required<SessionReason>();

  protected readonly texts = SESSION_TEXTS;
  protected readonly signingIn = signal(false);
  readonly #auth = inject(Auth);
  readonly #route = inject(ActivatedRoute);

  protected signIn(): void {
    this.signingIn.set(true);
    // ?voltarPara= set by Auth when it detects the loop.
    const returnTo = this.#route.snapshot.queryParamMap.get(RETURN_TO_PARAM);
    void this.#auth.signIn(returnTo ?? DEFAULT_DESTINATION);
  }
}
