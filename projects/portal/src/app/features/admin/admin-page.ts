import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Auth } from '@core/auth/auth';
import { APP_CONFIG } from '@core/config/app-config.tokens';
import { type FeatureFlag } from '@core/config/feature-flags.types';
import { UiBadge } from '@supermercado/ui/badge';
import { UiCardImports } from '@supermercado/ui/card';
import { UiTableImports } from '@supermercado/ui/table';

/** Diagnostics panel: who is signed in and which flags are on in this environment. */
@Component({
  selector: 'app-admin-page',
  imports: [UiBadge, UiCardImports, UiTableImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <header class="page-title">
        <h1>Administração</h1>
        <p>Sessão atual e feature flags do ambiente "{{ config.environment }}".</p>
      </header>

      <article ui-card>
        <div ui-card-header>
          <h2 ui-card-title>Sessão</h2>
          <p ui-card-description>Autenticação: modo "{{ config.auth.mode }}"</p>
        </div>
        <div ui-card-content>
          @if (auth.user(); as user) {
            <p>{{ user.name }} ({{ user.email }})</p>
            <p>
              @for (role of user.roles; track role) {
                <span ui-badge variant="secondary">{{ role }}</span>
              }
            </p>
          } @else {
            <p>Sem usuário (autenticação desligada).</p>
          }
        </div>
      </article>

      <div ui-table-container>
        <table ui-table>
          <thead ui-thead>
            <tr ui-tr>
              <th ui-th>Flag</th>
              <th ui-th>Estado</th>
            </tr>
          </thead>
          <tbody ui-tbody>
            @for (flag of flags; track flag.name) {
              <tr ui-tr>
                <td ui-td>
                  <code>{{ flag.name }}</code>
                </td>
                <td ui-td>
                  <span ui-badge [variant]="flag.on ? 'default' : 'outline'">
                    {{ flag.on ? 'ligada' : 'desligada' }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export default class AdminPage {
  protected readonly config = inject(APP_CONFIG);
  protected readonly auth = inject(Auth);
  protected readonly flags = (Object.keys(this.config.features) as FeatureFlag[]).map((name) => ({
    name,
    on: this.config.features[name],
  }));
}
