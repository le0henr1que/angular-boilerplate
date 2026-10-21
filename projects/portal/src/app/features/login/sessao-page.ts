import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { Auth } from '@core/auth/auth';
import { UiButton } from '@supermercado/ui/button';
import { UiEmptyImports } from '@supermercado/ui/empty';

type Motivo = 'saiu' | 'erro';

const TEXTOS: Record<Motivo, { titulo: string; descricao: string; acao: string }> = {
  saiu: {
    titulo: 'Você saiu',
    descricao: 'Sua sessão foi encerrada.',
    acao: 'Entrar de novo',
  },
  erro: {
    titulo: 'Não foi possível entrar',
    descricao: 'O login não foi concluído. Tente de novo; se continuar, fale com o suporte.',
    acao: 'Tentar de novo',
  },
};

/**
 * Páginas públicas de sessão (sem login):
 * - /saiu: para onde o backend redireciona depois do logout. Sem ela, voltar para uma tela
 *   logada mandaria direto para a Microsoft, que logaria de novo na hora.
 * - /erro-login: o app voltou do login sem sessão (backend com problema). Quebra o loop.
 */
@Component({
  selector: 'app-sessao-page',
  imports: [UiButton, UiEmptyImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pagina estreita">
      <div ui-empty>
        <div ui-empty-header>
          <h1 ui-empty-title>{{ textos[motivo()].titulo }}</h1>
          <p ui-empty-description>{{ textos[motivo()].descricao }}</p>
        </div>
        <div ui-empty-content>
          <button ui-button type="button" [disabled]="entrando()" (click)="entrar()">
            {{ textos[motivo()].acao }}
          </button>
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
export default class SessaoPage {
  /** Vem do `data` da rota. */
  readonly motivo = input.required<Motivo>();
  /** ?voltarPara= posto pelo Auth quando detecta o loop. */
  readonly voltarPara = input<string>();

  protected readonly textos = TEXTOS;
  protected readonly entrando = signal(false);
  readonly #auth = inject(Auth);

  protected entrar(): void {
    this.entrando.set(true);
    void this.#auth.entrar(this.voltarPara() ?? '/inicio');
  }
}
