import { inject, Injectable } from '@angular/core';
import { Logger } from '@core/logging/logger';
import { CarregadorMsal } from '../msal/carregador-msal';
import { type Usuario } from '../usuario';
import type { AuthGateway } from './auth-gateway';
import type { MsalAuthGateway } from './msal-auth-gateway';

/**
 * Modo `msal` sem o MSAL no bundle inicial: baixa o chunk do MSAL na primeira chamada
 * e repassa para o MsalAuthGateway de verdade (ver CarregadorMsal).
 */
@Injectable({ providedIn: 'root' })
export class MsalAuthGatewaySobDemanda implements AuthGateway {
  readonly #carregador = inject(CarregadorMsal);
  readonly #log = inject(Logger).com('auth');

  async #gateway(): Promise<MsalAuthGateway> {
    const fim = this.#log.medir('chunk do MSAL carregado');
    const { injector, chunk } = await this.#carregador.carregar();
    fim();
    return injector.get(chunk.MsalAuthGateway);
  }

  async buscarUsuario(): Promise<Usuario | null> {
    try {
      return await (await this.#gateway()).buscarUsuario();
    } catch (erro) {
      // Só cai aqui se o chunk não baixou: o próprio gateway já trata os erros do login.
      this.#log.error('não foi possível carregar o MSAL', erro);
      return null;
    }
  }

  async entrar(voltarPara: string): Promise<void> {
    return (await this.#gateway()).entrar(voltarPara);
  }

  async sair(): Promise<void> {
    return (await this.#gateway()).sair();
  }
}
