// Entry of the MSAL chunk (~320 kB). Only loaded through import() in MsalLoader:
// NEVER import this file (or the ones below) statically outside the chunk.
export { MsalAuthGateway } from '../gateways/msal-auth-gateway';
export { msalTokenInterceptor } from '../http/msal-token.interceptor';
export { provideMsal } from './provide-msal';
