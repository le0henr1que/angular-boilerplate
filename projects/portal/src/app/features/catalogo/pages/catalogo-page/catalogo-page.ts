import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UiAlertImports } from '@supermercado/ui/alert';
import { UiBadge } from '@supermercado/ui/badge';
import { UiButton } from '@supermercado/ui/button';
import { type UiColuna, UiDataTableImports } from '@supermercado/ui/data-table';
import { UiIcon } from '@supermercado/ui/icon';
import { UiInputGroupImports } from '@supermercado/ui/input';
import { UiLabel } from '@supermercado/ui/label';
import { UiPagination } from '@supermercado/ui/pagination';
import { UiSelect } from '@supermercado/ui/select';
import { UiSpinner } from '@supermercado/ui/spinner';
import { injectCatalogo } from '../../data-access/catalogo.queries';
import { injectFiltrosCatalogo } from '../../data-access/inject-filtros-catalogo';
import {
  CATEGORIAS_CATALOGO,
  type CategoriaCatalogo,
  type ItemCatalogo,
  OPCOES_POR_PAGINA,
  type PorPagina,
} from '../../models/item-catalogo.model';

@Component({
  selector: 'app-catalogo-page',
  imports: [
    CurrencyPipe,
    UiAlertImports,
    UiBadge,
    UiButton,
    UiDataTableImports,
    UiIcon,
    UiInputGroupImports,
    UiLabel,
    UiPagination,
    UiSelect,
    UiSpinner,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalogo-page.html',
  styleUrl: './catalogo-page.scss',
})
export default class CatalogoPage {
  // Os "hooks": filtros (estado na URL) e a consulta (cache por filtro + página).
  protected readonly filtros = injectFiltrosCatalogo();
  protected readonly catalogo = injectCatalogo(this.filtros.filtros);

  protected readonly categorias = CATEGORIAS_CATALOGO;
  protected readonly opcoesPorPagina = OPCOES_POR_PAGINA;

  /** Cada coluna lê um caminho do objeto da API, inclusive aninhado ("fornecedor.nome"). */
  protected readonly colunas: UiColuna<ItemCatalogo>[] = [
    { chave: 'id', titulo: '#', largura: '4rem' },
    { chave: 'nome', titulo: 'Produto' },
    { chave: 'categoria.nome', titulo: 'Categoria' },
    {
      chave: 'fornecedor.nome',
      titulo: 'Fornecedor',
      formatar: (nome, item) => `${nome} (${item.fornecedor.cidade})`,
    },
    { chave: 'preco', titulo: 'Preço', alinhar: 'direita' },
    { chave: 'estoque.quantidade', titulo: 'Estoque', alinhar: 'direita' },
  ];

  protected estoqueBaixo(item: ItemCatalogo): boolean {
    return item.estoque.quantidade <= item.estoque.minimo;
  }

  protected aoPesquisar(evento: SubmitEvent) {
    evento.preventDefault(); // sem isso o navegador recarregaria a página
    this.filtros.pesquisarAgora();
  }

  protected aoDigitar(evento: Event) {
    this.filtros.digitar((evento.target as HTMLInputElement).value);
  }

  protected aoMudarCategoria(evento: Event) {
    const valor = (evento.target as HTMLSelectElement).value;
    this.filtros.filtrarPorCategoria(
      CATEGORIAS_CATALOGO.includes(valor as CategoriaCatalogo) ? (valor as CategoriaCatalogo) : '',
    );
  }

  protected aoMudarEstoqueBaixo(evento: Event) {
    this.filtros.filtrarEstoqueBaixo((evento.target as HTMLInputElement).checked);
  }

  protected aoMudarPorPagina(evento: Event) {
    const valor = Number((evento.target as HTMLSelectElement).value);
    if (OPCOES_POR_PAGINA.includes(valor as PorPagina)) {
      this.filtros.mudarPorPagina(valor as PorPagina);
    }
  }
}
