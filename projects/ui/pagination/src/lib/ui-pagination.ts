import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { UiButton } from '@supermercado/ui/button';
import { UiIcon } from '@supermercado/ui/icon';

/** Um número de página ou as reticências entre dois blocos. */
export type ItemPaginacao = number | 'reticencias';

/**
 * Páginas a mostrar: sempre a primeira, a última e `vizinhas` de cada lado da atual.
 *   paginasVisiveis(6, 20) → [1, '…', 5, 6, 7, '…', 20]
 */
export function paginasVisiveis(atual: number, total: number, vizinhas = 1): ItemPaginacao[] {
  const itens: ItemPaginacao[] = [];
  for (let pagina = 1; pagina <= total; pagina++) {
    const perto = Math.abs(pagina - atual) <= vizinhas;
    if (pagina === 1 || pagina === total || perto) {
      itens.push(pagina);
    } else if (itens.at(-1) !== 'reticencias') {
      itens.push('reticencias');
    }
  }
  return itens;
}

/**
 * Navegação entre páginas. Não guarda estado: recebe a página atual e avisa a escolhida.
 *
 *   <ui-pagination [pagina]="pagina()" [totalPaginas]="total()" (mudarPagina)="ir($event)" />
 */
@Component({
  selector: 'ui-pagination',
  imports: [UiButton, UiIcon],
  template: `
    <nav [attr.aria-label]="rotulo()">
      <ul class="lista">
        <li>
          <button
            ui-button
            variant="ghost"
            size="sm"
            type="button"
            [disabled]="pagina() <= 1"
            (click)="mudarPagina.emit(pagina() - 1)"
          >
            <ui-icon name="chevron-left" />
            Anterior
          </button>
        </li>
        @for (item of itens(); track $index) {
          <li>
            @if (item === 'reticencias') {
              <span class="reticencias" aria-hidden="true">…</span>
            } @else {
              <button
                ui-button
                size="sm"
                type="button"
                class="numero"
                [variant]="item === pagina() ? 'outline' : 'ghost'"
                [attr.aria-current]="item === pagina() ? 'page' : null"
                [attr.aria-label]="'Página ' + item"
                (click)="item !== pagina() && mudarPagina.emit(item)"
              >
                {{ item }}
              </button>
            }
          </li>
        }
        <li>
          <button
            ui-button
            variant="ghost"
            size="sm"
            type="button"
            [disabled]="pagina() >= totalPaginas()"
            (click)="mudarPagina.emit(pagina() + 1)"
          >
            Próxima
            <ui-icon name="chevron-right" />
          </button>
        </li>
      </ul>
    </nav>
  `,
  styles: `
    :host {
      display: block;
    }
    .lista {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .numero {
      min-width: 2.25rem;
      font-variant-numeric: tabular-nums;
    }
    .reticencias {
      display: inline-flex;
      justify-content: center;
      width: 2.25rem;
      color: var(--muted-foreground);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiPagination {
  readonly pagina = input.required<number>();
  readonly totalPaginas = input.required<number>();
  /** Quantas páginas mostrar de cada lado da atual. */
  readonly vizinhas = input(1);
  readonly rotulo = input('Paginação');
  readonly mudarPagina = output<number>();

  protected readonly itens = computed(() =>
    paginasVisiveis(this.pagina(), this.totalPaginas(), this.vizinhas()),
  );
}
