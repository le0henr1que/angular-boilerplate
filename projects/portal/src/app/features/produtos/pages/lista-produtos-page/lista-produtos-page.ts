import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiAlertImports } from '@supermercado/ui/alert';
import { UiButton } from '@supermercado/ui/button';
import { UiEmptyImports } from '@supermercado/ui/empty';
import { UiIcon } from '@supermercado/ui/icon';
import { UiInputGroupImports } from '@supermercado/ui/input';
import { UiLabel } from '@supermercado/ui/label';
import { UiSelect } from '@supermercado/ui/select';
import { UiSkeleton } from '@supermercado/ui/skeleton';
import { UiSpinner } from '@supermercado/ui/spinner';
import { UiTableImports } from '@supermercado/ui/table';
import { ROTULO_STATUS, STATUS_PRODUTO, type StatusProduto } from '../../models/produto.model';
import { injectProdutos, injectPrefetchProduto } from '../../data-access/produtos.queries';
import { injectFiltrosProdutos } from '../../data-access/inject-filtros-produtos';
import { StatusProdutoBadge } from '../../ui/status-produto-badge';

@Component({
  selector: 'app-lista-produtos-page',
  imports: [
    RouterLink,
    DatePipe,
    CurrencyPipe,
    UiAlertImports,
    UiButton,
    UiEmptyImports,
    UiIcon,
    UiInputGroupImports,
    UiLabel,
    UiSelect,
    UiSkeleton,
    UiSpinner,
    UiTableImports,
    StatusProdutoBadge,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lista-produtos-page.html',
  styleUrl: './lista-produtos-page.css',
})
export default class ListaProdutosPage {
  // Os "hooks" — cada um encapsula um pedaço de lógica reutilizável.
  protected readonly filtros = injectFiltrosProdutos();
  protected readonly produtos = injectProdutos(this.filtros.filtros);
  protected readonly prefetch = injectPrefetchProduto();

  protected readonly opcoesStatus = STATUS_PRODUTO;
  protected readonly rotuloStatus = ROTULO_STATUS;
  protected readonly linhasCarregando = [1, 2, 3, 4, 5];

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
