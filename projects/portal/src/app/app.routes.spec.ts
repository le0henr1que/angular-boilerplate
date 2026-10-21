import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ProdutosApi } from '@features/produtos';
import { PRODUTOS_TESTE } from '@testing/produtos.fixture';
import { provideLocalePtBr } from '@testing/locale';
import { provideTestAppConfig } from '@testing/test-config';
import { provideTestQueryClient } from '@testing/test-query-client';
import { screen } from '@testing-library/angular';
import { routes } from './app.routes';

/** Testa a navegação de verdade: rotas reais, telas reais, só a API é falsa. */
describe('Rotas do app', () => {
  let harness: RouterTestingHarness;
  const api = {
    listar: vi.fn().mockResolvedValue(PRODUTOS_TESTE),
    buscar: vi.fn().mockResolvedValue(PRODUTOS_TESTE[0]),
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig(),
        provideTestQueryClient(),
        provideLocalePtBr(),
        { provide: ProdutosApi, useValue: api },
        provideRouter(routes, withComponentInputBinding()),
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  const url = () => TestBed.inject(Router).url;

  it('a raiz redireciona para /inicio', async () => {
    await harness.navigateByUrl('/');
    expect(url()).toBe('/inicio');
    expect(await screen.findByRole('heading', { name: /Bem-vindo/ })).toBeInTheDocument();
  });

  it('/produtos abre a lista (carregada sob demanda)', async () => {
    await harness.navigateByUrl('/produtos');
    expect(screen.getByRole('heading', { name: 'Produtos' })).toBeInTheDocument();
  });

  it('/produtos/:codigo abre o detalhe daquele produto', async () => {
    await harness.navigateByUrl('/produtos/HO-1');
    expect(await screen.findByRole('heading', { name: 'HO-1' })).toBeInTheDocument();
    expect(api.buscar).toHaveBeenCalledWith('HO-1');
  });

  it('endereço desconhecido mostra a página 404 com link para o início', async () => {
    await harness.navigateByUrl('/nao-existe');
    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para o início' })).toHaveAttribute('href', '/');
  });

  it('define o título da aba para cada página', async () => {
    await harness.navigateByUrl('/produtos');
    await vi.waitFor(() => expect(document.title).toBe('Produtos'));
    await harness.navigateByUrl('/nao-existe');
    await vi.waitFor(() => expect(document.title).toBe('Página não encontrada'));
  });
});
