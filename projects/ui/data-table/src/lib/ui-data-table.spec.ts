import { render, screen, within } from '@testing-library/angular';
import { lerCaminho } from './caminho';
import { UiCabecalho, UiCelula, type UiColuna, UiDataTable } from './ui-data-table';

interface Pedido {
  id: number;
  user: { name: string; endereco: { cidade: string } | null };
  total: number;
  status: 'pago' | 'pendente';
}

const PEDIDOS: Pedido[] = [
  { id: 1, user: { name: 'Ana', endereco: { cidade: 'Recife' } }, total: 10, status: 'pago' },
  { id: 2, user: { name: 'Bruno', endereco: null }, total: 25.5, status: 'pendente' },
];

const COLUNAS: UiColuna<Pedido>[] = [
  { chave: 'user.name', titulo: 'Cliente' },
  { chave: 'user.endereco.cidade', titulo: 'Cidade' },
  { chave: 'total', titulo: 'Total', formatar: (v) => `R$ ${v.toFixed(2)}`, alinhar: 'direita' },
  { chave: 'status', titulo: 'Status' },
  { id: 'acoes', titulo: 'Ações' },
];

const imports = [UiDataTable, UiCelula, UiCabecalho];

describe('lerCaminho', () => {
  it('acessa propriedades aninhadas pelo caminho com pontos', () => {
    expect(lerCaminho({ user: { name: 'Ana' } }, 'user.name')).toBe('Ana');
  });

  it('devolve undefined quando algo no meio do caminho é nulo', () => {
    expect(lerCaminho({ user: null }, 'user.name')).toBeUndefined();
  });
});

describe('UiDataTable', () => {
  it('monta cabeçalho e linhas a partir das colunas e dos dados', async () => {
    await render(`<ui-data-table [dados]="dados" [colunas]="colunas" />`, {
      imports,
      componentProperties: { dados: PEDIDOS, colunas: COLUNAS },
    });

    const titulos = screen.getAllByRole('columnheader').map((th) => th.textContent?.trim());
    expect(titulos).toEqual(['Cliente', 'Cidade', 'Total', 'Status', 'Ações']);

    const [, ana, bruno] = screen.getAllByRole('row');
    const celulasAna = within(ana).getAllByRole('cell').map((td) => td.textContent?.trim());
    expect(celulasAna).toEqual(['Ana', 'Recife', 'R$ 10.00', 'pago', '']);
    // Endereço nulo no meio do caminho: célula vazia, sem erro.
    expect(within(bruno).getAllByRole('cell')[1]).toHaveTextContent('');
  });

  it('usa o template uiCelula no lugar do valor, com valor, linha e índice', async () => {
    await render(
      `<ui-data-table [dados]="dados" [colunas]="colunas">
        <ng-template uiCelula="status" let-valor let-i="indice">
          <strong>{{ i }}-{{ valor }}</strong>
        </ng-template>
        <ng-template uiCelula="acoes" let-linha="linha">
          <button type="button">Editar {{ linha.user.name }}</button>
        </ng-template>
        <ng-template uiCabecalho="total" let-coluna>
          <em>{{ coluna.titulo }} (R$)</em>
        </ng-template>
      </ui-data-table>`,
      { imports, componentProperties: { dados: PEDIDOS, colunas: COLUNAS } },
    );

    expect(screen.getByText('0-pago').tagName).toBe('STRONG');
    expect(screen.getByText('1-pendente')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar Bruno' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Total (R$)' })).toBeInTheDocument();
  });

  it('mostra a mensagem quando não há dados', async () => {
    await render(
      `<ui-data-table [dados]="[]" [colunas]="colunas" mensagemVazia="Sem pedidos." />`,
      { imports, componentProperties: { colunas: COLUNAS } },
    );
    expect(screen.getByRole('cell', { name: 'Sem pedidos.' })).toHaveAttribute('colspan', '5');
  });

  it('mostra linhas de esqueleto enquanto carrega', async () => {
    const { container } = await render(
      `<ui-data-table [dados]="dados" [colunas]="colunas" carregando [linhasCarregando]="3" />`,
      { imports, componentProperties: { dados: PEDIDOS, colunas: COLUNAS } },
    );
    expect(screen.getAllByRole('row')).toHaveLength(4);
    expect(container.querySelectorAll('ui-skeleton')).toHaveLength(3 * COLUNAS.length);
    expect(screen.queryByText('Ana')).not.toBeInTheDocument();
  });
});
