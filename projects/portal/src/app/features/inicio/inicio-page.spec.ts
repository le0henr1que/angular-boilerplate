import { ProdutosApi, FILTROS_VAZIOS } from '@features/produtos';
import { PRODUTOS_TESTE } from '@testing/produtos.fixture';
import { provideTestAppConfig } from '@testing/test-config';
import { provideTestQueryClient } from '@testing/test-query-client';
import { render, screen, within } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import InicioPage from './inicio-page';

describe('InicioPage', () => {
  const api = { listar: vi.fn(), buscar: vi.fn() };

  async function renderizar() {
    return render(InicioPage, {
      providers: [
        provideTestAppConfig({ appName: 'Portal Teste' }),
        provideTestQueryClient(),
        provideRouter([]),
        { provide: ProdutosApi, useValue: api },
      ],
    });
  }

  /** Lê o código mostrado no card com o rótulo informado. */
  const totalDoCard = (rotulo: string) =>
    within(screen.getByText(rotulo).closest('article')!).getByText(/^\d+$/).textContent;

  beforeEach(() => api.listar.mockReset().mockResolvedValue(PRODUTOS_TESTE));

  it('dá boas-vindas com o nome do app', async () => {
    await renderizar();
    expect(screen.getByRole('heading', { name: 'Bem-vindo ao Portal Teste' })).toBeInTheDocument();
  });

  it('busca a lista SEM filtros (mesma chave de cache da tela de produtos)', async () => {
    await renderizar();
    expect(api.listar).toHaveBeenCalledWith(FILTROS_VAZIOS);
  });

  it('resume o estoque por status', async () => {
    await renderizar();
    await vi.waitFor(() => expect(totalDoCard('Total')).toBe('3'));
    expect(totalDoCard('Disponível')).toBe('1');
    expect(totalDoCard('Estoque baixo')).toBe('1');
    expect(totalDoCard('Esgotado')).toBe('1');
  });

  it('tem atalho para a lista de produtos', async () => {
    await renderizar();
    expect(screen.getByRole('link', { name: /Ver todos os produtos/ })).toHaveAttribute(
      'href',
      '/produtos',
    );
  });
});
