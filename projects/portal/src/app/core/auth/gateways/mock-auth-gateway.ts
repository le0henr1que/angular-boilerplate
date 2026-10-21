import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BffAuthGateway } from './bff-auth-gateway';

/** Endpoints que só existem na API simulada (src/mocks/mock-auth.interceptor.ts). */
export const MOCK_AUTH_URLS = {
  login: '/mock-auth/login',
  logout: '/mock-auth/logout',
} as const;

/**
 * Igual ao BFF real em tudo, menos no login/logout: em vez de redirecionar para a Microsoft,
 * pede para a API simulada criar/apagar o cookie de sessão. `buscarUsuario()` é herdado:
 * o mesmo GET auth.urls.usuario, respondido pelo mock a partir do cookie.
 */
@Injectable({ providedIn: 'root' })
export class MockAuthGateway extends BffAuthGateway {
  override async entrar(_voltarPara: string, persona = 'admin'): Promise<void> {
    await firstValueFrom(this.http.post(MOCK_AUTH_URLS.login, { persona }));
  }

  override async sair(): Promise<void> {
    await firstValueFrom(this.http.post(MOCK_AUTH_URLS.logout, null));
  }
}
