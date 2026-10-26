import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UiAlertImports } from '@supermercado/ui/alert';
import { UiBadge } from '@supermercado/ui/badge';
import { UiButton } from '@supermercado/ui/button';
import { type UiColuna, UiDataTableImports } from '@supermercado/ui/data-table';
import { UiIcon } from '@supermercado/ui/icon';
import { injectCatalogo } from '../../data-access/catalogo.queries';
import { type ItemCatalogo } from '../../models/item-catalogo.model';

@Component({
  selector: 'app-catalogo-page',
  imports: [CurrencyPipe, UiAlertImports, UiBadge, UiButton, UiDataTableImports, UiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalogo-page.html',
  styleUrl: './catalogo-page.scss',
})
export default class CatalogoPage {
  /** Lista do catálogo em cache (TanStack Query): voltar para a tela não chama a API de novo. */
  protected readonly itens = injectCatalogo();

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
}
