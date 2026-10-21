import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { PRODUTOS_TESTE } from '@testing/produtos.fixture';
import { provideLocalePtBr } from '@testing/locale';
import { provideTestQueryClient } from '@testing/test-query-client';
import { screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { ProdutosApi } from '../../data-access/produtos.api';
import { type Produto } from '../../models/produto.model';
import DetalheProdutoPage from './detalhe-produto-page';

@Component({ template: 'lista' })
class ListaFalsa {}

describe('DetalheProdutoPage', () => {
  const api = { listar: vi.fn(), buscar: vi.fn<(n: string) => Promise<Produto>>() };

  async function abrir(codigo: string) {
    TestBed.configureTestingModule({
      providers: [
        provideTestQueryClient(),
        provideLocalePtBr(),
        { provide: ProdutosApi, useValue: api },
        provideRouter(
          [
            { path: 'produtos', component: ListaFalsa },
            { path: 'produtos/:codigo', component: DetalheProdutoPage },
          ],
          withComponentInputBinding(),
        ),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/produtos/${codigo}`);
    return harness;
  }

  beforeEach(() => api.buscar.mockReset());

  it('mostra o esqueleto enquanto carrega', async () => {
    // Resposta controlada pelo teste. Uma Promise que nunca resolve deixaria uma "tarefa
    // pendente" do TanStack aberta para sempre e o TestBed não conseguiria encerrar o teste.
    let responder!: (a: Produto) => void;
    api.buscar.mockReturnValue(new Promise((resolve) => (responder = resolve)));
    await abrir('HO-1');

    expect(screen.getByLabelText('Carregando produto')).toHaveAttribute('aria-busy', 'true');

    responder(PRODUTOS_TESTE[0]);
    expect(await screen.findByRole('heading', { name: 'HO-1' })).toBeInTheDocument();
  });

  it('busca pelo código da rota e mostra os dados formatados', async () => {
    api.buscar.mockResolvedValue(PRODUTOS_TESTE[1]);
    await abrir('BE-2');

    expect(await screen.findByRole('heading', { name: 'BE-2' })).toBeInTheDocument();
    expect(api.buscar).toHaveBeenCalledWith('BE-2');
    expect(screen.getByText('Bebidas · Suco de laranja 1 L')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s9,80/)).toBeInTheDocument();
    expect(screen.getByText('10/02/2026')).toBeInTheDocument();
    expect(screen.getByText('09/08/2026')).toBeInTheDocument();
    expect(screen.getByText('Distribuidora Bom Preço')).toBeInTheDocument();
    expect(screen.getByText('Loja Norte')).toBeInTheDocument();
    expect(screen.getByText('Estoque baixo')).toBeInTheDocument();
  });

  it('mostra "não encontrado" quando a API responde 404', async () => {
    api.buscar.mockRejectedValueOnce(new HttpErrorResponse({ status: 404 }));
    await abrir('XX-9');
    expect(await screen.findByText('Produto não encontrado')).toBeInTheDocument();
    expect(api.buscar).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/XX-9/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeInTheDocument();
  });

  it('mostra erro com "Tentar de novo" para outras falhas', async () => {
    api.buscar
      .mockRejectedValueOnce(new HttpErrorResponse({ status: 500 }))
      .mockResolvedValueOnce(PRODUTOS_TESTE[0]);
    await abrir('HO-1');

    await userEvent.click(await screen.findByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByRole('heading', { name: 'HO-1' })).toBeInTheDocument();
  });

  it('o link "Voltar" leva para a lista', async () => {
    api.buscar.mockResolvedValue(PRODUTOS_TESTE[0]);
    await abrir('HO-1');
    await userEvent.click(screen.getByRole('link', { name: /Voltar para produtos/ }));
    await vi.waitFor(() => expect(TestBed.inject(Router).url).toBe('/produtos'));
  });
});
