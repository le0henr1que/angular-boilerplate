import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '@supermercado/ui/button';
import { UiEmptyImports } from '@supermercado/ui/empty';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, UiButton, UiEmptyImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page narrow">
      <div ui-empty>
        <div ui-empty-header>
          <h1 ui-empty-title>Página não encontrada</h1>
          <p ui-empty-description>O endereço que você abriu não existe.</p>
        </div>
        <div ui-empty-content>
          <a ui-button routerLink="/">Voltar para o início</a>
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
export default class NotFoundPage {}
