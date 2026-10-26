import { InjectionToken, type Provider } from '@angular/core';
import { type LogConfig } from '../logging/log-config';
import { type FeatureFlags } from './feature-flags';

/**
 * Nome do ambiente em vez de um `production: boolean`: um booleano não representa
 * homologação/staging. Para criar um novo ambiente, adicione-o aqui e o compilador
 * aponta todos os lugares que precisam tratá-lo.
 */
export type AppEnvironment = 'development' | 'homologation' | 'production';

/**
 * Autenticação. Dois jeitos de usar o Azure AD / Entra ID:
 *
 * - `bff` (cookie): o front NUNCA vê token. Quem fala com a Microsoft é o backend, que guarda a
 *   sessão num cookie HttpOnly. O front só conhece os endpoints de `urls`.
 * - `msal` (token no front): o MSAL faz o login no navegador e o front manda o access token
 *   para a API. Configuração em `msal`; `urls` e `headerCsrf` não são usados.
 */
export interface AuthConfig {
  /**
   * - `mock`: login simulado, sem backend (escolhe um usuário de teste; a API mock cria o cookie).
   * - `bff`: backend real. Login e logout são redirecionamentos de página inteira para ele.
   * - `msal`: o próprio front loga na Microsoft (MSAL) e manda `Authorization: Bearer` para a API.
   */
  readonly modo: 'mock' | 'bff' | 'msal';
  readonly urls: {
    /** Inicia o login no backend (que redireciona para a Microsoft). Recebe `?returnUrl=`. */
    readonly login: string;
    /** Encerra a sessão no backend (e na Microsoft). */
    readonly logout: string;
    /** Quem está logado: 200 com o usuário ou 401. */
    readonly usuario: string;
  };
  /**
   * Header anti-CSRF que o backend exige nas chamadas com cookie (ex.: `X-CSRF: 1`).
   * `null` = não envia.
   */
  readonly headerCsrf: { readonly nome: string; readonly valor: string } | null;
  /** Azure AD / Entra ID direto no front. Obrigatório quando `modo: 'msal'`; senão `null`. */
  readonly msal: MsalConfig | null;
}

/**
 * Valores do registro do app no Entra ID (portal Azure → App registrations).
 * Nada aqui é segredo: SPA não tem client secret. Passo a passo em docs/autenticacao-msal.md.
 */
export interface MsalConfig {
  /** "Application (client) ID" do registro do FRONT. */
  readonly clientId: string;
  /** `https://login.microsoftonline.com/<Directory (tenant) ID>`. */
  readonly authority: string;
  /** Caminho de volta do login. Precisa estar cadastrado em Authentication → Single-page application. */
  readonly redirectUri: string;
  /** Para quais APIs mandar o token, e com quais scopes. A URL é comparada pelo início. */
  readonly apis: readonly { readonly url: string; readonly scopes: readonly string[] }[];
  /**
   * Onde o MSAL guarda a sessão. `sessionStorage` (padrão): some ao fechar a aba, cada aba loga
   * (sem tela, pela sessão da Microsoft). `localStorage`: abas compartilham, mas fica mais exposto.
   */
  readonly cache: 'sessionStorage' | 'localStorage';
}

export interface AppConfig {
  readonly environment: AppEnvironment;
  readonly appName: string;
  /** Versão do app (o `version` do package.json). Aparece no rodapé. */
  readonly version: string;
  /** Endereço base da API. Os serviços montam as URLs a partir dele. */
  readonly apiUrl: string;
  /**
   * Liga a API simulada (src/mocks) para desenvolver sem backend.
   * Quando o backend existir, deixe false em todos os ambientes e apague a pasta mocks/.
   */
  readonly mockApi: boolean;
  readonly auth: AuthConfig;
  /** O que é logado e para onde vai (ver core/logging). */
  readonly log: LogConfig;
  /** Liga/desliga funcionalidades sem mexer no código (ver feature-flags.ts). */
  readonly features: FeatureFlags;
}

/**
 * Configuração de ambiente disponível via DI.
 * Só o `app.config.ts` importa `environments/`; o resto do app pede `inject(APP_CONFIG)`,
 * o que permite trocar a configuração em testes sem mexer em arquivos.
 */
export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

export function provideAppConfig(config: AppConfig): Provider {
  return { provide: APP_CONFIG, useValue: config };
}
