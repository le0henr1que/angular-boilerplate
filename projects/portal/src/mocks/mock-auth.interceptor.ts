import { HttpErrorResponse, type HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MOCK_AUTH_URLS } from '@core/auth/gateways/mock-auth-gateway';
import { PERSONAS_MOCK } from '@core/auth/gateways/personas-mock';
import { APP_CONFIG } from '@core/config/app-config';
import { delay, of, throwError } from 'rxjs';
import { apagarSessaoMock, gravarSessaoMock, lerSessaoMock } from './sessao-mock';

const LATENCIA_MS = 150;

const responder = <T>(status: number, body: T) =>
  of(new HttpResponse({ status, body })).pipe(delay(LATENCIA_MS));
const erro = (status: number, url: string) =>
  throwError(() => new HttpErrorResponse({ status, url })).pipe(delay(LATENCIA_MS));

/**
 * Faz o papel do BFF (backend de autenticação) enquanto ele não existe.
 * Só é registrado com `auth.modo: 'mock'` (ver app.config.ts).
 *
 *   POST /mock-auth/login  { persona }  → cria o cookie de sessão
 *   POST /mock-auth/logout              → apaga o cookie
 *   GET  auth.urls.usuario              → 200 com o usuário do cookie, ou 401
 */
export const mockAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const { auth } = inject(APP_CONFIG);

  if (req.method === 'POST' && req.url === MOCK_AUTH_URLS.login) {
    const { persona } = req.body as { persona: string };
    if (!PERSONAS_MOCK.some((p) => p.id === persona)) return erro(400, req.url);
    gravarSessaoMock(persona);
    return responder(204, null);
  }

  if (req.method === 'POST' && req.url === MOCK_AUTH_URLS.logout) {
    apagarSessaoMock();
    return responder(204, null);
  }

  if (req.method === 'GET' && req.url === auth.urls.usuario) {
    const sessao = lerSessaoMock();
    return sessao ? responder(200, sessao.usuario) : erro(401, req.url);
  }

  return next(req);
};
