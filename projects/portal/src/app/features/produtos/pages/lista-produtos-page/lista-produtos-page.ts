import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiAlertImports } from '@supermercado/ui/alert';
import { UiButton } from '@supermercado/ui/button';
import { type UiColuna, UiDataTableImports } from '@supermercado/ui/data-table';
import { UiEmptyImports } from '@supermercado/ui/empty';
import { UiIcon } from '@supermercado/ui/icon';
import { UiInputGroupImports } from '@supermercado/ui/input';
import { UiLabel } from '@supermercado/ui/label';
import { UiSelect } from '@supermercado/ui/select';
import { UiSkeleton } from '@supermercado/ui/skeleton';
import { UiSpinner } from '@supermercado/ui/spinner';
import {
  type Produto,
  ROTULO_STATUS,
  STATUS_PRODUTO,
  type StatusProduto,
} from '../../models/produto.model';
import { injectProdutos, injectPrefetchProduto } from '../../data-access/produtos.queries';
import { injectFiltrosProdutos } from '../../data-access/inject-filtros-produtos';
import { StatusProdutoBadge } from '../../ui/status-produto-badge';

@Component({
  selector: 'app-lista-produtos-page',
  imports: [
    RouterLink,
    CurrencyPipe,
    UiAlertImports,
    UiButton,
    UiDataTableImports,
    UiEmptyImports,
    UiIcon,
    UiInputGroupImports,
    UiLabel,
    UiSelect,
    UiSkeleton,
    UiSpinner,
    StatusProdutoBadge,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lista-produtos-page.html',
  styleUrl: './lista-produtos-page.scss',
})
export default class ListaProdutosPage {
  // Os "hooks" — cada um encapsula um pedaço de lógica reutilizável.
  protected readonly filtros = injectFiltrosProdutos();
  protected readonly produtos = injectProdutos(this.filtros.filtros);
  protected readonly prefetch = injectPrefetchProduto();

  protected readonly opcoesStatus = STATUS_PRODUTO;
  protected readonly rotuloStatus = ROTULO_STATUS;
  protected readonly linhasCarregando = [1, 2, 3, 4, 5];

  /** Colunas da tabela. Código, preço e status ganham célula própria no HTML (uiCelula). */
  protected readonly colunas: UiColuna<Produto>[] = [
    { chave: 'codigo', titulo: 'Código' },
    { chave: 'nome', titulo: 'Nome' },
    { chave: 'categoria', titulo: 'Categoria' },
    // A API manda "yyyy-mm-dd"; vira "dd/mm/yyyy" sem passar por fuso horário.
    { chave: 'validade', titulo: 'Validade', formatar: (v) => v.split('-').reverse().join('/') },
    { chave: 'preco', titulo: 'Preço', alinhar: 'direita' },
    { chave: 'status', titulo: 'Status' },
  ];

  /** O que o usuário digitou só vira filtro ao clicar em "Pesquisar" (ou Enter). */
  protected aoPesquisar(evento: SubmitEvent) {
    evento.preventDefault();
    const termo = new FormData(evento.target as HTMLFormElement).get('termo');
    this.filtros.pesquisar(typeof termo === 'string' ? termo : '');
  }

  protected aoMudarStatus(evento: Event) {
    const valor = (evento.target as HTMLSelectElement).value;
    const status = STATUS_PRODUTO.includes(valor as StatusProduto)
      ? (valor as StatusProduto)
      : 'todos';
    this.filtros.filtrarPorStatus(status);
  }
}
