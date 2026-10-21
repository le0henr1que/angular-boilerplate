import { HttpErrorResponse } from '@angular/common/http';
import { criarQueryClient, deveTentarDeNovo, MAXIMO_DE_TENTATIVAS } from './query-client';

describe('deveTentarDeNovo', () => {
  it.each([400, 401, 403, 404, 422])('não tenta de novo em erro %i do cliente', (status) => {
    expect(deveTentarDeNovo(0, new HttpErrorResponse({ status }))).toBe(false);
  });

  it.each([0, 500, 502, 503])('tenta de novo em erro %i (rede/servidor)', (status) => {
    expect(deveTentarDeNovo(0, new HttpErrorResponse({ status }))).toBe(true);
  });

  it('tenta de novo em erros que não são HTTP', () => {
    expect(deveTentarDeNovo(0, new Error('timeout'))).toBe(true);
  });

  it(`para depois de ${MAXIMO_DE_TENTATIVAS} tentativas`, () => {
    const erro = new HttpErrorResponse({ status: 500 });
    expect(deveTentarDeNovo(MAXIMO_DE_TENTATIVAS - 1, erro)).toBe(true);
    expect(deveTentarDeNovo(MAXIMO_DE_TENTATIVAS, erro)).toBe(false);
  });
});

describe('criarQueryClient', () => {
  it('usa 1 minuto de staleTime e a política de novas tentativas', () => {
    const { queries } = criarQueryClient().getDefaultOptions();
    expect(queries?.staleTime).toBe(60_000);
    expect(queries?.retry).toBe(deveTentarDeNovo);
  });

  it('cria um cache novo a cada chamada', () => {
    expect(criarQueryClient()).not.toBe(criarQueryClient());
  });
});
