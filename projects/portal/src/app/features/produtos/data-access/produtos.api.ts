import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config';
import { lastValueFrom } from 'rxjs';
import { type Produto, type FiltrosProdutos } from '../models/produto.model';

/**
 * Só fala com o servidor. Não guarda estado nem cache — isso é trabalho do TanStack Query
 * (ver produtos.queries.ts). Devolve Promise porque é o que o TanStack espera, igual no React.
 */
@Injectable({ providedIn: 'root' })
export class ProdutosApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(APP_CONFIG).apiUrl}/produtos`;

  listar(filtros: FiltrosProdutos): Promise<Produto[]> {
    let params = new HttpParams();
    if (filtros.termo) params = params.set('q', filtros.termo);
    if (filtros.status !== 'todos') params = params.set('status', filtros.status);
    return lastValueFrom(this.http.get<Produto[]>(this.url, { params }));
  }

  buscar(codigo: string): Promise<Produto> {
    return lastValueFrom(this.http.get<Produto>(`${this.url}/${encodeURIComponent(codigo)}`));
  }
}
