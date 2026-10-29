import { render, screen, within } from '@testing-library/angular';
import { readPath } from './path.utils';
import { UiCell, UiColumnHeader, UiDataTable } from './ui-data-table';
import { type UiColumn } from './ui-data-table.types';

interface Order {
  id: number;
  user: { name: string; address: { city: string } | null };
  total: number;
  status: 'pago' | 'pendente';
}

const ORDERS: Order[] = [
  { id: 1, user: { name: 'Ana', address: { city: 'Recife' } }, total: 10, status: 'pago' },
  { id: 2, user: { name: 'Bruno', address: null }, total: 25.5, status: 'pendente' },
];

const COLUMNS: UiColumn<Order>[] = [
  { key: 'user.name', title: 'Cliente' },
  { key: 'user.address.city', title: 'Cidade' },
  { key: 'total', title: 'Total', format: (v) => `R$ ${v.toFixed(2)}`, align: 'end' },
  { key: 'status', title: 'Status' },
  { id: 'actions', title: 'Ações' },
];

const imports = [UiDataTable, UiCell, UiColumnHeader];

describe('readPath', () => {
  it('reads nested properties by dotted path', () => {
    expect(readPath({ user: { name: 'Ana' } }, 'user.name')).toBe('Ana');
  });

  it('returns undefined when something along the path is null', () => {
    expect(readPath({ user: null }, 'user.name')).toBeUndefined();
  });
});

describe('UiDataTable', () => {
  it('builds the header and rows from the columns and the data', async () => {
    await render(`<ui-data-table [data]="data" [columns]="columns" />`, {
      imports,
      componentProperties: { data: ORDERS, columns: COLUMNS },
    });

    const titles = screen.getAllByRole('columnheader').map((th) => th.textContent?.trim());
    expect(titles).toEqual(['Cliente', 'Cidade', 'Total', 'Status', 'Ações']);

    const [, ana, bruno] = screen.getAllByRole('row');
    const anaCells = within(ana)
      .getAllByRole('cell')
      .map((td) => td.textContent?.trim());
    expect(anaCells).toEqual(['Ana', 'Recife', 'R$ 10.00', 'pago', '']);
    // Null address along the path: empty cell, no error.
    expect(within(bruno).getAllByRole('cell')[1]).toHaveTextContent('');
  });

  it('uses the uiCell template instead of the value, with value, row and index', async () => {
    await render(
      `<ui-data-table [data]="data" [columns]="columns">
        <ng-template uiCell="status" let-value let-i="index">
          <strong>{{ i }}-{{ value }}</strong>
        </ng-template>
        <ng-template uiCell="actions" let-row="row">
          <button type="button">Editar {{ row.user.name }}</button>
        </ng-template>
        <ng-template uiColumnHeader="total" let-column>
          <em>{{ column.title }} (R$)</em>
        </ng-template>
      </ui-data-table>`,
      { imports, componentProperties: { data: ORDERS, columns: COLUMNS } },
    );

    expect(screen.getByText('0-pago').tagName).toBe('STRONG');
    expect(screen.getByText('1-pendente')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar Bruno' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Total (R$)' })).toBeInTheDocument();
  });

  it('shows the message when there is no data', async () => {
    await render(`<ui-data-table [data]="[]" [columns]="columns" emptyMessage="Sem pedidos." />`, {
      imports,
      componentProperties: { columns: COLUMNS },
    });
    expect(screen.getByRole('cell', { name: 'Sem pedidos.' })).toHaveAttribute('colspan', '5');
  });

  it('shows skeleton rows while loading', async () => {
    const { container } = await render(
      `<ui-data-table [data]="data" [columns]="columns" loading [loadingRows]="3" />`,
      { imports, componentProperties: { data: ORDERS, columns: COLUMNS } },
    );
    expect(screen.getAllByRole('row')).toHaveLength(4);
    expect(container.querySelectorAll('ui-skeleton')).toHaveLength(3 * COLUMNS.length);
    expect(screen.queryByText('Ana')).not.toBeInTheDocument();
  });
});
