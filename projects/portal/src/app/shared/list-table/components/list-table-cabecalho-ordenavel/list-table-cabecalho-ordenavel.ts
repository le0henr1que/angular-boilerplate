import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { type IconName, UiIcon } from '@supermercado/ui/icon';
import {
  DIRECAO_ORDENACAO,
  type DirecaoOrdenacao,
  type Ordenacao,
} from '../../models/list-table.models';

const ICONE_SEM_ORDENACAO: IconName = 'arrow-up-down';
const ICONE_POR_DIRECAO: Record<DirecaoOrdenacao, IconName> = {
  [DIRECAO_ORDENACAO.crescente]: 'arrow-up',
  [DIRECAO_ORDENACAO.decrescente]: 'arrow-down',
};

/** Cabeçalho clicável de uma coluna ordenável. Apresentacional: só avisa o clique. */
@Component({
  selector: 'app-list-table-cabecalho-ordenavel',
  imports: [UiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="botao"
      [class.ativo]="direcao()"
      [attr.aria-label]="rotulo()"
      [attr.data-direcao]="direcao()"
      (click)="ordenar.emit()"
    >
      {{ titulo() }}
      <ui-icon [name]="icone()" />
    </button>
  `,
  styles: `
    .botao {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0;
      border: 0;
      background: none;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    .botao ui-icon {
      opacity: 0.4;
    }
    .botao.ativo ui-icon {
      opacity: 1;
    }
    .botao:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }
  `,
})
export class ListTableCabecalhoOrdenavel {
  readonly titulo = input.required<string>();
  /** Id da coluna. */
  readonly campo = input.required<string>();
  readonly ordenacao = input.required<Ordenacao | null>();
  /** Texto para leitores de tela ("Ordenar por Preço"). */
  readonly rotulo = input.required<string>();
  readonly ordenar = output<void>();

  /** Direção desta coluna; null se a ordenação atual é por outra. */
  protected readonly direcao = computed<DirecaoOrdenacao | null>(() => {
    const ordenacao = this.ordenacao();
    if (ordenacao?.campo !== this.campo()) return null;
    return ordenacao.direcao;
  });

  protected readonly icone = computed<IconName>(() => {
    const direcao = this.direcao();
    if (!direcao) return ICONE_SEM_ORDENACAO;
    return ICONE_POR_DIRECAO[direcao];
  });
}
