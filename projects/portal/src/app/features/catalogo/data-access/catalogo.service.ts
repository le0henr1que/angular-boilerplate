import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config';
import { type Observable } from 'rxjs';
import { type FiltrosCatalogo, type PaginaCatalogo } from '../models/item-catalogo.model';

/**
 * Só fala com o servidor. Em desenvolvimento (mockApi: true) quem responde é a API simulada
 * (src/mocks/mock-api.interceptor.ts); a tela não sabe a diferença.
 *
 * Para usar a API real, troque o endpoint abaixo. O mock só responde URLs que começam com
 * o `apiUrl` do environment; uma URL completa (https://...) vai direto para o servidor.
 *
 *   GET {url}?q=cafe&categoria=Bebidas&estoqueBaixo=true&pagina=2&porPagina=10
 */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(APP_CONFIG).apiUrl}/catalogo`;

  listar(filtros: FiltrosCatalogo): Observable<PaginaCatalogo> {
    let params = new HttpParams()
      .set('pagina', filtros.pagina)
      .set('porPagina', filtros.porPagina);
    const termo = filtros.termo.trim();
    if (termo) params = params.set('q', termo);
    if (filtros.categoria) params = params.set('categoria', filtros.categoria);
    if (filtros.estoqueBaixo) params = params.set('estoqueBaixo', true);
    return this.http.get<PaginaCatalogo>(this.url, { params });
  }
}
