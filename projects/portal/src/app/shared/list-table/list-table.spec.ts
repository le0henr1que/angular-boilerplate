import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideTestQueryClient } from '@testing/test-query-client';
import { screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { type Observable, of } from 'rxjs';
import { injectListTableFilter } from './hooks/inject-list-table-filter';
import {
  type CampoUrl,
  definirFiltro,
  filtroBooleano,
  filtroOpcoes,
  type ListTableColuna,
  type ListTableFonte,
  ListTableImports,
  type ListTableRequisicao,
  type ListTableResultado,
  provideListTable,
  type ValoresDosCampos,
} from './index';

interface Pedido {
  id: number;
  cliente: string;
  total: number;
}

const PEDIDOS: Pedido[] = [
  { id: 1, cliente: 'Ana', total: 10 },
  { id: 2, cliente: 'Bruno', total: 20 },
];

const STATUS = ['aberto', 'pago'] as const;

const FILTROS = {
  status: filtroOpcoes('status', STATUS),
  urgente: filtroBooleano('urgente'),
  loja: definirFiltro({ param: 'loja', padrao: 0, ler: (texto) => Number(texto) || 0 }),
};
type Filtros = ValoresDosCampos<typeof FILTROS>;
type Resultado = ListTableResultado<Pedido>;

const COLUNAS: ListTableColuna<Pedido>[] = [
  { chave: 'id', titulo: '#' },
  { chave: 'cliente', titulo: 'Cliente', ordenavel: true },
  { chave: 'total', titulo: 'Total', ordenavel: true },
];

/** Um filtro "de fora", criado só com o hook público. */
@Component({
  selector: 'app-filtro-loja',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button type="button" (click)="loja.definir(7)">Loja {{ loja.valor() }}</button>`,
})
class FiltroLoja {
  readonly filtro = input.required<CampoUrl<number>>();
  protected readonly loja = injectListTableFilter(this.filtro);
}

@Component({
  imports: [ListTableImports, FiltroLoja],
  template: `
    <app-list-table
      [fonte]="fonte"
      [colunas]="colunas"
      [filtros]="filtros"
      [paginacao]="paginacao()"
      [busca]="busca()"
    >
      <app-list-table-filtro-opcoes
        rotulo="Status"
        rotuloTodas="Todos"
        [filtro]="filtros.status"
        [opcoes]="status"
      />
      <app-list-table-filtro-booleano rotulo="Urgente" [filtro]="filtros.urgente" />
      <app-filtro-loja [filtro]="filtros.loja" />
    </app-list-table>
  `,
})
class Host {
  readonly buscar = vi.fn<(requisicao: ListTableRequisicao<Filtros>) => Observable<Resultado>>(() =>
    of({ itens: PEDIDOS, total: 25, totalPaginas: 3 }),
  );
  readonly fonte: ListTableFonte<Pedido, Filtros> = { chave: ['pedidos'], buscar: this.buscar };
  readonly colunas = COLUNAS;
  readonly filtros = FILTROS;
  readonly status = STATUS;
  readonly paginacao = signal(true);
  readonly busca = signal(true);
}

describe('ListTable', () => {
  const user = userEvent.setup();
  let harness: RouterTestingHarness;
  let host: Host;

  async function abrir(url = '/pedidos') {
    TestBed.configureTestingModule({
      providers: [provideTestQueryClient(), provideRouter([{ path: 'pedidos', component: Host }])],
    });
    harness = await RouterTestingHarness.create();
    host = await harness.navigateByUrl(url, Host);
    await screen.findByText('Ana');
  }

  const url = () => TestBed.inject(Router).url;
  const ultimaRequisicao = () => host.buscar.mock.calls[0][0];
  const estavel = () => harness.fixture.whenStable();

  afterEach(() => vi.useRealTimers());

  it('já vem com busca, ordenação e paginação, e lê tudo da URL', async () => {
    await abrir(
      '/pedidos?q=ana&status=pago&urgente=true&loja=3&pagina=2&porPagina=20&ordenarPor=total&direcao=desc',
    );
    expect(ultimaRequisicao()).toEqual({
      filtros: { status: 'pago', urgente: true, loja: 3 },
      busca: 'ana',
      paginacao: { pagina: 2, porPagina: 20 },
      ordenacao: { campo: 'total', direcao: 'desc' },
    });
    expect(screen.getByLabelText('Pesquisar')).toHaveValue('ana');
    expect(screen.getByLabelText('Status')).toHaveValue('pago');
    expect(screen.getByLabelText('Urgente')).toBeChecked();
    expect(screen.getByRole('button', { name: 'Página 3' })).toBeInTheDocument();
  });

  it('troca valores inválidos da URL pelo padrão', async () => {
    await abrir('/pedidos?status=xyz&pagina=-2&porPagina=999&ordenarPor=id&direcao=xyz');
    expect(ultimaRequisicao()).toEqual({
      filtros: { status: '', urgente: false, loja: 0 },
      busca: '',
      paginacao: { pagina: 1, porPagina: 10 },
      ordenacao: null, // "id" não é ordenável
    });
  });

  it('busca com debounce, substituindo o histórico', async () => {
    await abrir();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const campo = screen.getByLabelText('Pesquisar');
    await user.type(campo, 'bru');
    expect(url()).toBe('/pedidos'); // ainda não
    await vi.advanceTimersByTimeAsync(300);
    vi.useRealTimers();
    await estavel();
    expect(url()).toBe('/pedidos?q=bru');
  });

  it('Enter pesquisa na hora e não apaga o espaço que o usuário digitou', async () => {
    await abrir();
    await user.type(screen.getByLabelText('Pesquisar'), 'bruno {Enter}');
    await vi.waitFor(() => expect(url()).toBe('/pedidos?q=bruno'));
    expect(screen.getByLabelText('Pesquisar')).toHaveValue('bruno ');
  });

  it('trocar um filtro (pronto ou criado com o hook) volta para a página 1', async () => {
    await abrir('/pedidos?pagina=3');
    await user.selectOptions(screen.getByLabelText('Status'), 'aberto');
    await vi.waitFor(() => expect(url()).toBe('/pedidos?status=aberto'));

    await user.click(screen.getByRole('button', { name: 'Loja 0' }));
    await vi.waitFor(() => expect(url()).toBe('/pedidos?status=aberto&loja=7'));
    expect(screen.getByRole('button', { name: 'Loja 7' })).toBeInTheDocument();
  });

  it('ordena pelo cabeçalho: crescente → decrescente → sem ordenação', async () => {
    await abrir('/pedidos?pagina=2');
    const ordenarPorTotal = () => screen.getByRole('button', { name: 'Ordenar por Total' });

    await user.click(ordenarPorTotal());
    await vi.waitFor(() => expect(url()).toBe('/pedidos?ordenarPor=total&direcao=asc'));
    expect(ordenarPorTotal()).toHaveAttribute('data-direcao', 'asc');

    await user.click(ordenarPorTotal());
    await vi.waitFor(() => expect(url()).toBe('/pedidos?ordenarPor=total&direcao=desc'));

    await user.click(ordenarPorTotal());
    await vi.waitFor(() => expect(url()).toBe('/pedidos'));
    expect(ordenarPorTotal()).not.toHaveAttribute('data-direcao');
  });

  it('paginação: troca a página e os itens por página na URL', async () => {
    await abrir();
    await user.click(screen.getByRole('button', { name: 'Página 3' }));
    await vi.waitFor(() => expect(url()).toBe('/pedidos?pagina=3'));
    await user.selectOptions(screen.getByLabelText('Itens por página'), '50');
    await vi.waitFor(() => expect(url()).toBe('/pedidos?porPagina=50'));
  });

  it('pré-carrega a próxima página', async () => {
    await abrir();
    await vi.waitFor(() =>
      expect(host.buscar.mock.calls.map(([r]) => r.paginacao?.pagina)).toEqual([1, 2]),
    );
  });

  it('Limpar tira busca e filtros, mas mantém os itens por página', async () => {
    await abrir('/pedidos?q=ana&status=pago&pagina=2&porPagina=50');
    await user.click(screen.getByRole('button', { name: 'Limpar' }));
    await vi.waitFor(() => expect(url()).toBe('/pedidos?porPagina=50'));
    expect(screen.getByLabelText('Pesquisar')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Limpar' })).not.toBeInTheDocument();
  });

  it('desliga paginação e busca', async () => {
    await abrir('/pedidos?pagina=2&q=ana');
    host.paginacao.set(false);
    host.busca.set(false);
    await estavel();

    expect(screen.queryByRole('navigation', { name: 'Paginação' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Itens por página')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Pesquisar')).not.toBeInTheDocument();
    await vi.waitFor(() =>
      expect(host.buscar).toHaveBeenLastCalledWith(
        expect.objectContaining({ paginacao: null, busca: '' }),
      ),
    );
  });

  it('mostra as linhas e o total', async () => {
    await abrir();
    const [, primeira] = screen.getAllByRole('row');
    expect(within(primeira).getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('25 item(ns)')).toBeInTheDocument();
  });

  it('provideListTable troca nomes de parâmetro e textos', async () => {
    TestBed.configureTestingModule({
      providers: [provideListTable({ params: { busca: 'termo' }, textos: { busca: 'Buscar' } })],
    });
    await abrir('/pedidos?termo=ana');
    expect(ultimaRequisicao().busca).toBe('ana');
    expect(screen.getByLabelText('Buscar')).toHaveValue('ana');
  });
});
