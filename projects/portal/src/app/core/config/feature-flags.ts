import { inject } from '@angular/core';
import { type CanMatchFn } from '@angular/router';
import { APP_CONFIG } from './app-config';

/**
 * Tudo que pode ser ligado/desligado por ambiente (environments/*.ts).
 * Flag nova: adicione aqui e o compilador aponta os environments que precisam do valor.
 */
export interface FeatureFlags {
  /** Exige login. Desligado = app aberto, sem tela de login e sem checagem de papel. */
  readonly autenticacao: boolean;
  /** Checa papéis (admin, operador...). Desligado = qualquer usuário logado acessa tudo. */
  readonly controleDePapeis: boolean;
  /** Área administrativa (/admin e link no menu). */
  readonly areaAdmin: boolean;
  /** Tela de fornecedores (/fornecedores e link no menu). */
  readonly fornecedores: boolean;
  /** Pré-carrega em segundo plano as rotas marcadas com `data: { preload: true }`. */
  readonly preload: boolean;
  /** Anima a troca de telas (View Transitions API do navegador). */
  readonly transicoesDeTela: boolean;
  /** Painel do TanStack Query (botão flutuante). */
  readonly devtoolsQuery: boolean;
}

export type FeatureFlag = keyof FeatureFlags;

/** Lê as flags em qualquer lugar com DI: `const flags = injectFeatures(); flags.areaAdmin`. */
export function injectFeatures(): FeatureFlags {
  return inject(APP_CONFIG).features;
}

/** Gate de rota: com a flag desligada a rota "não existe" (cai no 404) e o chunk nem é baixado. */
export function exigeFeature(flag: FeatureFlag): CanMatchFn {
  return () => injectFeatures()[flag];
}
