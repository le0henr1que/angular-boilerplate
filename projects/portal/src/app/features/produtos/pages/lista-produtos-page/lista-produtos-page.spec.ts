import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { PRODUTOS_TESTE } from '@testing/produtos.fixture';
import { provideLocalePtBr } from '@testing/locale';
import { provideTestQueryClient } from '@testing/test-query-client';
import { screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { type Produto, type FiltrosProdutos } from '../../models/produto.model';
import { ProdutosApi } from '../../data-access/produtos.api';
import ListaProdutosPage from './lista-produtos-page';

@Component({ template: 'detalhe' })
class DetalheFalso {}

describe('ListaProdutosPage', () => {
  const api = {
    listar: vi.fn<(f: FiltrosProdutos) => Promise<Produto[]>>(),
    buscar: vi.fn<(n: string) => Promise<Produto>>(),
  };
  let harness: RouterTestingHarness;

  async function abrir(url = '/produtos') {
    TestBed.configureTestingModule({
      providers: [
        provideTestQueryClient(),
        provideLocalePtBr(),
        { provide: ProdutosApi, useValue: api },
        provideRouter([
          { path: 'produtos', component: ListaProdutosPage },
          { path: 'produtos/:codigo', component: DetalheFalso },
        ]),
      ],
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
  }

  const url = () => TestBed.inject(Router).url;
  const user = userEvent.setup();

  beforeEach(() => {
    api.listar.mockReset().mockResolvedValue(PRODUTOS_TESTE);
    api.buscar.mockReset().mockResolvedValue(PRODUTOS_TESTE[0]);
  });

  it('mostra o esqueleto de carregamento na primeira busca', async () => {
    api.listar.mockReturnValue(new Promise(() => undefined)); // nunca responde
    await abrir();
    expect(screen.getByLabelText('Carregando produtos')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('mostra a tabela com os dados formatados em pt-BR', async () => {
    await abrir();
    const tabela = await screen.findByRole('table');
    const linhas = within(tabela).getAllByRole('row');
    expect(linhas).toHaveLength(1 + PRODUTOS_TESTE.length); // cabeçalho + dados

    const primeira = within(linhas[1]);
    expect(primeira.getByRole('link', { name: 'HO-1' })).toHaveAttribute('href', '/produtos/HO-1');
    expect(primeira.getByText('Banana prata (kg)')).toBeInTheDocument();
    expect(primeira.getByText(/R\$\s7,99/)).toBeInTheDocument();
    expect(primeira.getByText(/08\/01\/2026/)).toBeInTheDocument();
    expect(primeira.getByText('Disponível')).toBeInTheDocument();
    expect(screen.getByText(/3 produto\(s\)/)).toBeInTheDocument();
  });

  it('pesquisa ao clicar em "Pesquisar": grava na URL e chama a API com o termo', async () => {
    await abrir();
    await screen.findByRole('table');

    await user.type(screen.getByLabelText('Pesquisar'), 'banana');
    await user.click(screen.getByRole('button', { name: 'Pesquisar' }));

    await vi.waitFor(() => expect(url()).toBe('/produtos?q=banana'));
    await vi.waitFor(() =>
      expect(api.listar).toHaveBeenLastCalledWith({ termo: 'banana', status: 'todos' }),
    );
  });

  it('pesquisa ao apertar Enter sem recarregar a página', async () => {
    await abrir();
    await user.type(screen.getByLabelText('Pesquisar'), 'suco{Enter}');
    await vi.waitFor(() => expect(url()).toBe('/produtos?q=suco'));
  });

  it('não pesquisa enquanto o usuário só digita', async () => {
    await abrir();
    await screen.findByRole('table');
    await user.type(screen.getByLabelText('Pesquisar'), 'banana');
    expect(url()).toBe('/produtos');
    expect(api.listar).toHaveBeenCalledTimes(1);
  });

  it('filtra por status ao trocar o select', async () => {
    await abrir();
    await user.selectOptions(screen.getByLabelText('Status'), 'baixo');
    await vi.waitFor(() => expect(url()).toBe('/produtos?status=baixo'));
    await vi.waitFor(() =>
      expect(api.listar).toHaveBeenLastCalledWith({ termo: '', status: 'baixo' }),
    );
  });

  it('abre com os filtros da URL já aplicados no formulário', async () => {
    await abrir('/produtos?q=pao&status=esgotado');
    expect(screen.getByLabelText('Pesquisar')).toHaveValue('pao');
    expect(screen.getByLabelText('Status')).toHaveValue('esgotado');
    expect(api.listar).toHaveBeenCalledWith({ termo: 'pao', status: 'esgotado' });
  });

  it('"Limpar" só aparece com filtro e remove os filtros', async () => {
    await abrir();
    expect(screen.queryByRole('button', { name: 'Limpar' })).not.toBeInTheDocument();

    await harness.navigateByUrl('/produtos?q=banana');
    await user.click(await screen.findByRole('button', { name: 'Limpar' }));

    await vi.waitFor(() => expect(url()).toBe('/produtos'));
    await vi.waitFor(() => expect(screen.getByLabelText('Pesquisar')).toHaveValue(''));
  });

  it('mostra o estado vazio quando nada é encontrado', async () => {
    api.listar.mockResolvedValue([]);
    await abrir('/produtos?q=zzz');
    expect(await screen.findByText('Nenhum produto encontrado')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    await vi.waitFor(() => expect(url()).toBe('/produtos'));
  });

  it('mostra o erro e permite tentar de novo', async () => {
    api.listar.mockRejectedValueOnce(new Error('fora do ar'));
    await abrir();
    expect(await screen.findByText('Não foi possível carregar os produtos')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(api.listar).toHaveBeenCalledTimes(2);
  });

  it('pré-carrega o detalhe ao passar o mouse no código', async () => {
    await abrir();
    await user.hover(await screen.findByRole('link', { name: 'BE-2' }));
    await vi.waitFor(() => expect(api.buscar).toHaveBeenCalledWith('BE-2'));
  });

  it('navega para o detalhe ao clicar no código', async () => {
    await abrir();
    await user.click(await screen.findByRole('link', { name: 'PA-3' }));
    await vi.waitFor(() => expect(url()).toBe('/produtos/PA-3'));
  });
});
