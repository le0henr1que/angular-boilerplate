import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiAlertImports } from '@supermercado/ui/alert';
import { UiButton } from '@supermercado/ui/button';
import { UiCardImports } from '@supermercado/ui/card';
import { UiEmptyImports } from '@supermercado/ui/empty';
import { UiIcon } from '@supermercado/ui/icon';
import { UiSkeleton } from '@supermercado/ui/skeleton';
import { injectProduto } from '../../data-access/produtos.queries';
import { StatusProdutoBadge } from '../../ui/status-produto-badge';

@Component({
  selector: 'app-detalhe-produto-page',
  imports: [
    RouterLink,
    DatePipe,
    CurrencyPipe,
    UiAlertImports,
    UiButton,
    UiCardImports,
    UiEmptyImports,
    UiIcon,
    UiSkeleton,
    StatusProdutoBadge,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './detalhe-produto-page.html',
  styleUrl: './detalhe-produto-page.scss',
})
export default class DetalheProdutoPage {
  /** Vem do parâmetro :codigo da rota (withComponentInputBinding no app.config.ts). */
  readonly codigo = input.required<string>();

  // Se você passou o mouse na linha da lista, isto já está no cache e abre na hora.
  protected readonly produto = injectProduto(this.codigo);

  protected readonly naoEncontrado = computed(() => {
    const erro = this.produto.error();
    return erro instanceof HttpErrorResponse && erro.status === 404;
  });
}
