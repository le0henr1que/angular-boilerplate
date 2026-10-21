import { type EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { Auth } from './auth';

/**
 * Consulta a sessão (GET auth.urls.usuario) ANTES da primeira rota.
 * Assim os guards já sabem quem está logado no F5, sem "piscar" a tela de login.
 */
export function provideAuth(): EnvironmentProviders {
  return provideAppInitializer(() => inject(Auth).carregarSessao());
}
