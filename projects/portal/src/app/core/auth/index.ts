export { Auth, destinoInterno } from './auth';
export { authInterceptor } from './http/auth.interceptor';
export { apenasLoginSimulado, apenasVisitante, exigeLogin, exigePapel } from './guards/auth.guards';
export { provideAuth } from './provide-auth';
export { type Papel, type Usuario } from './usuario';
