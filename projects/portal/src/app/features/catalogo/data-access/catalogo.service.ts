import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config';
import { type Observable } from 'rxjs';
import {
  CATALOGO_ENDPOINT,
  type PaginaCatalogo,
  PARAM_LIGADO,
  PARAMS_CATALOGO,
  type RequisicaoCatalogo,
  TODAS_CATEGORIAS,
} from '../models/item-catalogo.model';

/**
 * Só fala com o servidor. Em desenvolvimento (mockApi: true) quem responde é a API simulada
 * (src/mocks/mock-api.interceptor.ts); a tela não sabe a diferença.
 *
 * Para usar a API real, troque o endpoint abaixo. O mock só responde URLs que começam com
 * o `apiUrl` do environment; uma URL completa (https://...) vai direto para o servidor.
 *
 *   GET {url}?q=cafe&categoria=Bebidas&estoqueBaixo=true&pagina=2&porPagina=10&ordenarPor=preco&direcao=desc
 */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(APP_CONFIG).apiUrl}${CATALOGO_ENDPOINT}`;

  listar({ filters, search, pagination, sort }: RequisicaoCatalogo): Observable<PaginaCatalogo> {
    let params = new HttpParams();
    const termo = search.trim();
    if (termo) params = params.set(PARAMS_CATALOGO.termo, termo);
    if (filters.categoria !== TODAS_CATEGORIAS) {
      params = params.set(PARAMS_CATALOGO.categoria, filters.categoria);
    }
    if (filters.estoqueBaixo) params = params.set(PARAMS_CATALOGO.estoqueBaixo, PARAM_LIGADO);
    if (pagination) {
      params = params
        .set(PARAMS_CATALOGO.pagina, pagination.page)
        .set(PARAMS_CATALOGO.porPagina, pagination.pageSize);
    }
    if (sort) {
      params = params
        .set(PARAMS_CATALOGO.ordenarPor, sort.field)
        .set(PARAMS_CATALOGO.direcao, sort.direction);
    }
    return this.http.get<PaginaCatalogo>(this.url, { params });
  }
}
