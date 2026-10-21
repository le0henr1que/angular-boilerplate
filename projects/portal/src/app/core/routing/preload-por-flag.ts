import { Injectable } from '@angular/core';
import { type PreloadingStrategy, type Route } from '@angular/router';
import { type Observable, of } from 'rxjs';

/**
 * Pré-carrega em segundo plano só as rotas com `data: { preload: true }`,
 * e nada quando o usuário ativou economia de dados.
 *
 * Atenção: `canMatch` NÃO impede o preload. Não marque rota restrita por papel.
 */
@Injectable({ providedIn: 'root' })
export class PreloadPorFlag implements PreloadingStrategy {
  preload(route: Route, carregar: () => Observable<unknown>): Observable<unknown> {
    const conexao = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const querPreload = route.data?.['preload'] === true;
    return querPreload && !conexao?.saveData ? carregar() : of(null);
  }
}
