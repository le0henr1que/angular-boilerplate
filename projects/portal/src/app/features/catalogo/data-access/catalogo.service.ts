import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config';
import { type Observable } from 'rxjs';
import { type ItemCatalogo } from '../models/item-catalogo.model';

/**
 * Só fala com o servidor. Em desenvolvimento (mockApi: true) quem responde é a API simulada
 * (src/mocks/mock-api.interceptor.ts); a tela não sabe a diferença.
 *
 * Para usar a API real, troque o endpoint abaixo. O mock só responde URLs que começam com
 * o `apiUrl` do environment; uma URL completa (https://...) vai direto para o servidor.
 */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(APP_CONFIG).apiUrl}/catalogo`;

  listar(): Observable<ItemCatalogo[]> {
    return this.http.get<ItemCatalogo[]>(this.url);
  }
}
