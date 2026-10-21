// Entrada do chunk do MSAL (~320 kB). Só é carregado por import() no CarregadorMsal:
// NUNCA importe este arquivo (nem os abaixo) de forma estática fora do chunk.
export { MsalAuthGateway } from '../gateways/msal-auth-gateway';
export { msalTokenInterceptor } from '../http/msal-token.interceptor';
export { provideMsal } from './provide-msal';
