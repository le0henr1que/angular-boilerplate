import type { AppConfig } from '@core/config/app-config';
import { version } from '../../../../package.json';

// Homologação (`ng build -c homologation`). Substitui environment.ts via fileReplacements no
// angular.json. Tudo aqui vai para o bundle público: nunca coloque segredos.
// (Client secret, tenant e afins do Azure AD ficam no BACKEND, nunca aqui.)
export const environment: AppConfig = {
  environment: 'homologation',
  appName: 'Portal Supermercado (HML)',
  version,
  apiUrl: '/api',
  mockApi: false,
  auth: {
    // Azure AD direto no front (MSAL). Para voltar ao backend com cookie: modo 'bff'.
    modo: 'msal',
    msal: {
      // Preencha com o registro do app no Entra ID (docs/autenticacao-msal.md).
      clientId: 'COLOQUE-AQUI-O-CLIENT-ID-DO-FRONT',
      authority: 'https://login.microsoftonline.com/COLOQUE-AQUI-O-TENANT-ID',
      redirectUri: '/',
      apis: [{ url: '/api', scopes: ['api://COLOQUE-AQUI-O-CLIENT-ID-DA-API/acesso'] }],
      cache: 'sessionStorage',
    },
    // Usados só no modo 'bff'.
    urls: { login: '/bff/login', logout: '/bff/logout', usuario: '/bff/user' },
    headerCsrf: { nome: 'X-CSRF', valor: '1' },
  },
  log: {
    // Só avisos e erros. Para depurar em produção, no console do navegador:
    // supermercadoLog.nivel('debug')  …  supermercadoLog.nivel(null) para voltar.
    nivel: 'warn',
    // Quando o backend tiver o endpoint, troque por: { url: '/api/logs', nivel: 'warn' }
    remoto: null,
  },
  features: {
    // Ligue depois de preencher auth.msal (ver docs/autenticacao-msal.md).
    autenticacao: false,
    controleDePapeis: true,
    areaAdmin: false,
    fornecedores: true,
    preload: true,
    transicoesDeTela: true,
    devtoolsQuery: false,
  },
};
