import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ListTableImports, type ListTableColuna } from '@shared/list-table';
import { UiBadge } from '@supermercado/ui/badge';
import { UiDataTableImports } from '@supermercado/ui/data-table';
import { injectFonteCatalogo } from '../../data-access/catalogo.queries';
import {
  CATEGORIAS_CATALOGO,
  estaComEstoqueBaixo,
  FILTROS_CATALOGO,
  type ItemCatalogo,
  OPCOES_POR_PAGINA,
} from '../../models/item-catalogo.model';

/** Colunas com template próprio (uiCelula): a mesma chave na definição e no HTML. */
const COLUNA = {
  preco: 'preco',
  estoque: 'estoque.quantidade',
} as const;

/**
 * A tela só diz O QUE listar: a fonte, as colunas e os filtros específicos (categoria e
 * estoque baixo). Busca, ordenação, paginação, estados e cache vêm da app-list-table.
 */
@Component({
  selector: 'app-catalogo-page',
  imports: [CurrencyPipe, ListTableImports, UiBadge, UiDataTableImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalogo-page.html',
  styleUrl: './catalogo-page.scss',
})
export default class CatalogoPage {
  protected readonly fonte = injectFonteCatalogo();
  protected readonly filtros = FILTROS_CATALOGO;
  protected readonly categorias = CATEGORIAS_CATALOGO;
  protected readonly opcoesPorPagina = OPCOES_POR_PAGINA;
  protected readonly coluna = COLUNA;
  protected readonly estoqueBaixo = estaComEstoqueBaixo;

  /** Cada coluna lê um caminho do objeto da API, inclusive aninhado ("fornecedor.nome"). */
  protected readonly colunas: ListTableColuna<ItemCatalogo>[] = [
    { chave: 'id', titulo: '#', largura: '4rem' },
    { chave: 'nome', titulo: 'Produto', ordenavel: true },
    { chave: 'categoria.nome', titulo: 'Categoria', ordenavel: true },
    {
      chave: 'fornecedor.nome',
      titulo: 'Fornecedor',
      formatar: (nome, item) => `${nome} (${item.fornecedor.cidade})`,
    },
    { chave: COLUNA.preco, titulo: 'Preço', alinhar: 'direita', ordenavel: true },
    { chave: COLUNA.estoque, titulo: 'Estoque', alinhar: 'direita', ordenavel: true },
  ];
}
