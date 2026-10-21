import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Auth } from '@core/auth/auth';
import { APP_CONFIG } from '@core/config/app-config';
import { type FeatureFlag } from '@core/config/feature-flags';
import { UiBadge } from '@supermercado/ui/badge';
import { UiCardImports } from '@supermercado/ui/card';
import { UiTableImports } from '@supermercado/ui/table';

/** Painel de diagnóstico: quem está logado e quais flags estão ligadas neste ambiente. */
@Component({
  selector: 'app-admin-page',
  imports: [UiBadge, UiCardImports, UiTableImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pagina">
      <header class="titulo-pagina">
        <h1>Administração</h1>
        <p>Sessão atual e feature flags do ambiente "{{ config.environment }}".</p>
      </header>

      <article ui-card>
        <div ui-card-header>
          <h2 ui-card-title>Sessão</h2>
          <p ui-card-description>Autenticação: modo "{{ config.auth.modo }}"</p>
        </div>
        <div ui-card-content>
          @if (auth.usuario(); as usuario) {
            <p>{{ usuario.nome }} ({{ usuario.email }})</p>
            <p>
              @for (papel of usuario.papeis; track papel) {
                <span ui-badge variant="secondary">{{ papel }}</span>
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
            @for (flag of flags; track flag.nome) {
              <tr ui-tr>
                <td ui-td>
                  <code>{{ flag.nome }}</code>
                </td>
                <td ui-td>
                  <span ui-badge [variant]="flag.ligada ? 'default' : 'outline'">
                    {{ flag.ligada ? 'ligada' : 'desligada' }}
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
  protected readonly flags = (Object.keys(this.config.features) as FeatureFlag[]).map((nome) => ({
    nome,
    ligada: this.config.features[nome],
  }));
}
