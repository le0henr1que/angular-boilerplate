import { PERSONAS_MOCK, type PersonaMock } from '@core/auth/gateways/personas-mock';

/**
 * Cookie de sessão da API SIMULADA.
 *
 * No backend real o cookie é HttpOnly: o JavaScript não consegue ler nem escrever.
 * Aqui não existe servidor, então o mock faz o papel dele e usa document.cookie.
 * Só a pasta mocks/ toca em cookie; o app nunca lê o cookie, só chama GET auth.urls.usuario.
 */
const COOKIE = 'supermercado_sessao_mock';

export function lerSessaoMock(): PersonaMock | null {
  const valor = document.cookie
    .split('; ')
    .find((par) => par.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  return PERSONAS_MOCK.find((p) => p.id === decodeURIComponent(valor ?? '')) ?? null;
}

/** Cookie de sessão (sem max-age): some ao fechar o navegador, como o do backend. */
export function gravarSessaoMock(personaId: string): void {
  document.cookie = `${COOKIE}=${encodeURIComponent(personaId)}; path=/; SameSite=Lax`;
}

export function apagarSessaoMock(): void {
  document.cookie = `${COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
