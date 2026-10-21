import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '@supermercado/ui/button';
import { UiEmptyImports } from '@supermercado/ui/empty';

@Component({
  selector: 'app-sem-permissao-page',
  imports: [RouterLink, UiButton, UiEmptyImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pagina estreita">
      <div ui-empty>
        <div ui-empty-header>
          <h1 ui-empty-title>Sem permissão</h1>
          <p ui-empty-description>Seu usuário não tem acesso a esta área.</p>
        </div>
        <div ui-empty-content>
          <a ui-button routerLink="/">Voltar para o início</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .pagina {
      padding-top: 4rem;
    }
  `,
})
export default class SemPermissaoPage {}
