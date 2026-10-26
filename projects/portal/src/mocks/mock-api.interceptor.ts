import {
  HttpErrorResponse,
  type HttpInterceptorFn,
  type HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config';
import { Logger } from '@core/logging/logger';
import {
  CATALOGO_ENDPOINT,
  estaComEstoqueBaixo,
  FILTROS_CATALOGO_VAZIOS,
  type PaginaCatalogo,
  PARAM_LIGADO,
  PARAMS_CATALOGO,
  PRIMEIRA_PAGINA,
} from '@features/catalogo';
import { STATUS_PRODUTO, type StatusProduto } from '@features/produtos';
import { delay, of, throwError } from 'rxjs';
import { CATALOGO_DB } from './catalogo.db';
import { PRODUTOS_DB } from './produtos.db';
import { lerSessaoMock } from './sessao-mock';

/** Latência simulada, para os estados de carregamento e o efeito do cache ficarem visíveis. */
const LATENCIA_MS = 800;

/** Teto de itens por página que a API aceita (o front só usa OPCOES_POR_PAGINA). */
const POR_PAGINA_MAXIMO = 100;

/** Remove acentos e caixa: "Maçã" e "maca" encontram o mesmo produto. */
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const limitar = (valor: number, minimo: number, maximo: number) =>
  Math.min(Math.max(Math.trunc(valor), minimo), maximo);

const responder = <T>(body: T) =>
  of(new HttpResponse({ status: 200, body })).pipe(delay(LATENCIA_MS));
const naoEncontrado = (url: string) =>
  throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found', url })).pipe(
    delay(LATENCIA_MS),
  );

/** Número de um parâmetro; ausente, zero ou não numérico vira o padrão. */
function numeroOuPadrao(valor: string | null, padrao: number): number {
  const numero = Number(valor);
  if (Number.isNaN(numero) || numero === 0) return padrao;
  return numero;
}

/** GET /catalogo: filtra e pagina NO SERVIDOR, como a API real; o front só recebe a página pedida. */
function listarCatalogo(params: HttpParams): PaginaCatalogo {
  const termo = normalizar(params.get(PARAMS_CATALOGO.termo) ?? FILTROS_CATALOGO_VAZIOS.termo);
  const categoria = params.get(PARAMS_CATALOGO.categoria);
  const estoqueBaixo = params.get(PARAMS_CATALOGO.estoqueBaixo) === PARAM_LIGADO;
  const filtrados = CATALOGO_DB.filter(
    (item) =>
      (!termo || normalizar(`${item.nome} ${item.fornecedor.nome}`).includes(termo)) &&
      (!categoria || item.categoria.nome === categoria) &&
      (!estoqueBaixo || estaComEstoqueBaixo(item)),
  );
  const porPagina = limitar(
    numeroOuPadrao(params.get(PARAMS_CATALOGO.porPagina), FILTROS_CATALOGO_VAZIOS.porPagina),
    PRIMEIRA_PAGINA,
    POR_PAGINA_MAXIMO,
  );
  const totalPaginas = Math.max(PRIMEIRA_PAGINA, Math.ceil(filtrados.length / porPagina));
  const pagina = limitar(
    numeroOuPadrao(params.get(PARAMS_CATALOGO.pagina), PRIMEIRA_PAGINA),
    PRIMEIRA_PAGINA,
    totalPaginas,
  );
  const inicio = (pagina - PRIMEIRA_PAGINA) * porPagina;
  return {
    itens: filtrados.slice(inicio, inicio + porPagina),
    total: filtrados.length,
    pagina,
    porPagina,
    totalPaginas,
  };
}

/**
 * API simulada para desenvolver sem backend. Só é registrada quando `mockApi: true`
 * no environment (ver app.config.ts). Responde como a API REST real responderia:
 *
 *   GET {apiUrl}/produtos?q=texto&status=disponivel
 *   GET {apiUrl}/produtos/:codigo
 *   GET {apiUrl}/catalogo?q=texto&categoria=Bebidas&estoqueBaixo=true&pagina=2&porPagina=10
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const { apiUrl, auth, features } = inject(APP_CONFIG);
  if (!req.url.startsWith(`${apiUrl}/`) || req.method !== 'GET') return next(req);

  const rota = req.url.slice(apiUrl.length);
  inject(Logger).com('mock-api').debug(`${req.method} ${req.urlWithParams}`);

  // Como a API real: sem cookie de sessão válido, 401 (o authInterceptor manda para o login).
  if (features.autenticacao && auth.modo === 'mock' && !lerSessaoMock()) {
    return throwError(
      () => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized', url: req.url }),
    ).pipe(delay(LATENCIA_MS));
  }

  if (rota === '/produtos') {
    const termo = normalizar(req.params.get('q') ?? '');
    const status = req.params.get('status');
    return responder(
      PRODUTOS_DB.filter(
        (p) =>
          (!termo || normalizar(`${p.codigo} ${p.nome} ${p.categoria}`).includes(termo)) &&
          (!STATUS_PRODUTO.includes(status as StatusProduto) || p.status === status),
      ),
    );
  }

  if (rota === CATALOGO_ENDPOINT) return responder(listarCatalogo(req.params));

  const detalhe = rota.match(/^\/produtos\/([^/]+)$/);
  if (detalhe) {
    const produto = PRODUTOS_DB.find((p) => p.codigo === decodeURIComponent(detalhe[1]));
    return produto ? responder(produto) : naoEncontrado(req.url);
  }

  return naoEncontrado(req.url);
};
