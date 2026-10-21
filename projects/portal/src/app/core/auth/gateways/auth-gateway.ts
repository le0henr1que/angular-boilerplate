import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config';
import { BffAuthGateway } from './bff-auth-gateway';
import { MockAuthGateway } from './mock-auth-gateway';
import { MsalAuthGatewaySobDemanda } from './msal-auth-gateway-sob-demanda';
import { type Usuario } from '../usuario';

/**
 * Como o app conversa com quem autentica. O resto do app só conhece o serviço `Auth`;
 * trocar mock ↔ bff ↔ msal é só mudar `auth.modo` no environment.
 */
@Injectable({
  providedIn: 'root',
  useFactory: (): AuthGateway => {
    switch (inject(APP_CONFIG).auth.modo) {
      case 'mock':
        return inject(MockAuthGateway);
      case 'bff':
        return inject(BffAuthGateway);
      case 'msal':
        // Sob demanda: o MSAL (~320 kB) só é baixado quando este modo é usado.
        return inject(MsalAuthGatewaySobDemanda);
    }
  },
})
export abstract class AuthGateway {
  /** Quem está logado agora, ou null. Roda antes da 1ª rota (provideAuth). */
  abstract buscarUsuario(): Promise<Usuario | null>;
  /** Inicia o login. `persona` só existe no modo mock. */
  abstract entrar(voltarPara: string, persona?: string): Promise<void>;
  abstract sair(): Promise<void>;
}
