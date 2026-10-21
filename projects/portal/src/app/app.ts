import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { injectCarregamentoGlobal } from '@core/layout/carregamento-global';
import { AppHeader } from '@core/layout/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!--
      Mesmo HTML do index.html (classes em styles.css): quando o Angular troca um pelo outro,
      nada pisca. O resto fica por baixo, inerte (sem foco nem leitor de tela), até ficar pronto.
    -->
    @if (carregando()) {
      <div class="carregamento-global" role="status">
        <span class="carregamento-global-spinner" aria-hidden="true"></span>
        <span class="sr-only">Carregando…</span>
      </div>
    }
    <app-header [attr.inert]="carregando() ? '' : null" />
    <main [attr.inert]="carregando() ? '' : null">
      <router-outlet />
    </main>
  `,
})
export class App {
  protected readonly carregando = injectCarregamentoGlobal();
}
