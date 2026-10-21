import type { AppConfig } from '@core/config/app-config';

// Desenvolvimento (`ng serve`). Substitui environment.ts via fileReplacements no angular.json.
export const environment: AppConfig = {
  environment: 'development',
  appName: 'Portal Supermercado (DEV)',
  apiUrl: '/api',
  mockApi: true,
  auth: {
    // ── Versão com login simulado (descomente para voltar e comente o bloco msal abaixo) ──
    // A tela de login lista usuários de teste (core/auth/gateways/personas-mock.ts).
    modo: 'mock',
    msal: {
      // Preencha com o registro do app no Entra ID (docs/autenticacao-msal.md).
      clientId: 'COLOQUE-AQUI-O-CLIENT-ID-DO-FRONT',
      authority: 'https://login.microsoftonline.com/COLOQUE-AQUI-O-TENANT-ID',
      redirectUri: '/',
      apis: [{ url: '/api', scopes: ['api://COLOQUE-AQUI-O-CLIENT-ID-DA-API/acesso'] }],
      cache: 'sessionStorage',
    },

    // ── Azure AD (Entra ID) direto no front ──
    // Valores falsos: redireciona para login.microsoftonline.com, mas a Microsoft responde
    // AADSTS700016 (app não registrado). Troque pelo registro real (docs/autenticacao-msal.md).
    // A authority precisa ser um tenant que exista ('common' serve): o MSAL baixa os metadados
    // dela antes de redirecionar e, com tenant inválido, falha sem sair da página.
    // modo: 'msal',
    // msal: {
    //   clientId: '00000000-0000-0000-0000-000000000000',
    //   authority: 'https://login.microsoftonline.com/common',
    //   redirectUri: '/',
    //   apis: [{ url: '/api', scopes: ['api://00000000-0000-0000-0000-000000000000/acesso'] }],
    //   cache: 'sessionStorage',
    // },
    urls: { login: '/bff/login', logout: '/bff/logout', usuario: '/bff/user' },
    headerCsrf: { nome: 'X-CSRF', valor: '1' },
  },
  log: {
    // Tudo: HTTP, navegação, cronômetros. Filtre no DevTools por [http], [navegacao]...
    nivel: 'debug',
    remoto: null,
  },
  features: {
    autenticacao: true,
    controleDePapeis: true,
    areaAdmin: true,
    fornecedores: true,
    preload: true,
    transicoesDeTela: true,
    devtoolsQuery: true,
  },
};
