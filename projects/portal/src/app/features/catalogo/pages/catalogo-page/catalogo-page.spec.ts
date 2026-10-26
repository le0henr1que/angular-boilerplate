import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { criarQueryClient } from '@core/query/query-client';
import { provideTanStackQuery } from '@tanstack/angular-query-experimental';
import { provideLocalePtBr } from '@testing/locale';
import { provideTestQueryClient } from '@testing/test-query-client';
import { screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NEVER, of, throwError } from 'rxjs';
import { CatalogoService } from '../../data-access/catalogo.service';
import {
  type FiltrosCatalogo,
  type ItemCatalogo,
  type PaginaCatalogo,
} from '../../models/item-catalogo.model';
import CatalogoPage from './catalogo-page';

const ITENS: ItemCatalogo[] = [
  {
    id: 1,
    nome: 'Banana prata (kg)',
    preco: 7.99,
    categoria: { id: 1, nome: 'Hortifruti' },
    fornecedor: { nome: 'Sítio Bom Fruto', cidade: 'Petrolina' },
    estoque: { quantidade: 120, minimo: 30 },
  },
  {
    id: 2,
    nome: 'Pão de forma integral',
    preco: 12.5,
    categoria: { id: 2, nome: 'Padaria' },
    fornecedor: { nome: 'Trigo Fino', cidade: 'Recife' },
    estoque: { quantidade: 8, minimo: 15 },
  },
];

@Component({ template: 'outra' })
class OutraPagina {}

/** Resposta da API:a página pedida com os ITENS, num total de 3 páginas. */
const responder = (filtros: FiltrosCatalogo) =>
  of<PaginaCatalogo>({
    itens: ITENS,
    total: 25,
    pagina: filtros.pagina,
    porPagina: filtros.porPagina,
    totalPaginas: 3,
  });

describe('CatalogoPage', () => {
  const service = { listar: vi.fn() };
  const user = userEvent.setup();
  let harness: RouterTestingHarness;

  async function abrir(url = '/catalogo', queryClient = provideTestQueryClient()) {
    TestBed.configureTestingModule({
      providers: [
        provideLocalePtBr(),
        queryClient,
        { provide: CatalogoService, useValue: service },
        provideRouter([
          { path: 'catalogo', component: CatalogoPage },
          { path: 'outra', component: OutraPagina },
        ]),
      ],
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
  }

  const url = () => TestBed.inject(Router).url;
  /** Filtros de cada chamada à API, na ordem. */
  const chamadas = (): FiltrosCatalogo[] => service.listar.mock.calls.map(([f]) => f);

  // Chaves: no Vitest, uma função devolvida pelo beforeEach roda como limpeza no fim do teste.
  beforeEach(() => {
    service.listar.mockReset().mockImplementation(responder);
  });

  it('mostra a página vinda da API, lendo os campos aninhados', async () => {
    await abrir();
    await screen.findByText('Banana prata (kg)');
    const linhas = screen.getAllByRole('row');
    expect(linhas).toHaveLength(1 + ITENS.length);

    const celulas = within(linhas[1]).getAllByRole('cell').map((td) => td.textContent?.trim());
    expect(celulas[2]).toBe('Hortifruti');
    expect(celulas[3]).toBe('Sítio Bom Fruto (Petrolina)');
    expect(celulas[4]).toMatch(/R\$\s7,99/);
    expect(screen.getByText(/25 item\(ns\)/)).toBeInTheDocument();
    expect(chamadas()[0]).toEqual({
      termo: '',
      categoria: '',
      estoqueBaixo: false,
      pagina: 1,
      porPagina: 10,
    });
  });

  it('marca o estoque abaixo do mínimo', async () => {
    await abrir();
    await screen.findByText('Banana prata (kg)');
    const [, banana, pao] = screen.getAllByRole('row');
    expect(within(banana).queryByText('Baixo')).not.toBeInTheDocument();
    expect(within(pao).getByText('Baixo')).toBeInTheDocument();
  });

  it('pré-carrega a próxima página assim que a atual chega', async () => {
    await abrir();
    await screen.findByText('Banana prata (kg)');
    await vi.waitFor(() => expect(chamadas().map((f) => f.pagina)).toEqual([1, 2]));
  });

  it('manda os filtros da URL para a API', async () => {
    await abrir('/catalogo?q=cafe&categoria=Bebidas&estoqueBaixo=true&pagina=2');
    await screen.findByText('Banana prata (kg)');
    expect(chamadas()[0]).toEqual({
      termo: 'cafe',
      categoria: 'Bebidas',
      estoqueBaixo: true,
      pagina: 2,
      porPagina: 10,
    });
    expect(screen.getByLabelText('Pesquisar')).toHaveValue('cafe');
    expect(screen.getByLabelText('Categoria')).toHaveValue('Bebidas');
    expect(screen.getByLabelText('Só estoque baixo')).toBeChecked();
  });

  it('Enter pesquisa na hora, grava na URL e chama a API com o termo', async () => {
    await abrir();
    await screen.findByText('Banana prata (kg)');
    await user.type(screen.getByLabelText('Pesquisar'), 'cafe{Enter}');
    await vi.waitFor(() => expect(url()).toBe('/catalogo?q=cafe'));
    await vi.waitFor(() => expect(chamadas().some((f) => f.termo === 'cafe')).toBe(true));
  });

  it('categoria e estoque baixo filtram e voltam para a página 1', async () => {
    await abrir('/catalogo?pagina=3');
    await screen.findByText('Banana prata (kg)');
    await user.selectOptions(screen.getByLabelText('Categoria'), 'Padaria');
    await vi.waitFor(() => expect(url()).toBe('/catalogo?categoria=Padaria'));
    await user.click(screen.getByLabelText('Só estoque baixo'));
    await vi.waitFor(() => expect(url()).toBe('/catalogo?categoria=Padaria&estoqueBaixo=true'));
  });

  it('a paginação troca a página na URL', async () => {
    await abrir();
    await screen.findByText('Banana prata (kg)');
    await user.click(screen.getByRole('button', { name: 'Página 3' }));
    await vi.waitFor(() => expect(url()).toBe('/catalogo?pagina=3'));
    await user.click(await screen.findByRole('button', { name: 'Anterior' }));
    await vi.waitFor(() => expect(url()).toBe('/catalogo?pagina=2'));
  });

  it('mostra o esqueleto enquanto a API não responde', async () => {
    service.listar.mockReturnValue(NEVER);
    await abrir();
    expect(screen.getAllByRole('rowgroup')[1]).toHaveAttribute('aria-busy', 'true');
  });

  it('mostra o erro e tenta de novo', async () => {
    service.listar.mockReturnValueOnce(throwError(() => new Error('falhou')));
    await abrir();
    await user.click(await screen.findByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByText('Banana prata (kg)')).toBeInTheDocument();
  });

  it('não chama a API de novo ao sair e voltar para a tela (usa o cache)', async () => {
    // O QueryClient do app (com staleTime), não o de teste: é ele que define o cache.
    await abrir('/catalogo', provideTanStackQuery(criarQueryClient()));
    await screen.findByText('Banana prata (kg)');
    await vi.waitFor(() => expect(service.listar).toHaveBeenCalledTimes(2)); // página 1 + prefetch da 2

    await harness.navigateByUrl('/outra'); // saiu da tela (o componente é destruído)
    expect(screen.queryByText('Banana prata (kg)')).not.toBeInTheDocument();

    await harness.navigateByUrl('/catalogo'); // voltou
    expect(screen.getByText('Banana prata (kg)')).toBeInTheDocument(); // na hora, do cache
    expect(service.listar).toHaveBeenCalledTimes(2);
  });
});
