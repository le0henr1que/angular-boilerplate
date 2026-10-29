import { UiBadge } from '@supermercado/ui/badge';
import { UiButton } from '@supermercado/ui/button';
import { type UiColumn, UiDataTable, UiDataTableImports } from '@supermercado/ui/data-table';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular';

interface Order {
  id: number;
  user: { name: string; email: string };
  total: number;
  status: 'pago' | 'pendente' | 'cancelado';
}

const ORDERS: Order[] = [
  { id: 101, user: { name: 'Ana Souza', email: 'ana@exemplo.com' }, total: 152.9, status: 'pago' },
  {
    id: 102,
    user: { name: 'Bruno Lima', email: 'bruno@exemplo.com' },
    total: 48,
    status: 'pendente',
  },
  {
    id: 103,
    user: { name: 'Carla Dias', email: 'carla@exemplo.com' },
    total: 310.4,
    status: 'cancelado',
  },
];

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const COLUMNS: UiColumn<Order>[] = [
  { key: 'id', title: '#', width: '4rem' },
  { key: 'user.name', title: 'Cliente' },
  { key: 'user.email', title: 'E-mail' },
  { key: 'total', title: 'Total', format: (v) => currency.format(v), align: 'end' },
  { key: 'status', title: 'Status' },
  { id: 'actions', title: '', align: 'end' },
];

const STATUS_VARIANT = { pago: 'default', pendente: 'secondary', cancelado: 'destructive' };

const meta: Meta<UiDataTable<Order>> = {
  title: 'Components/Data Table',
  component: UiDataTable,
  decorators: [moduleMetadata({ imports: [UiDataTableImports, UiBadge, UiButton] })],
};

export default meta;
type Story = StoryObj<UiDataTable<Order>>;

const TEMPLATE = `
  <ui-data-table [data]="data" [columns]="columns" [loading]="loading">
    <ng-template uiCell="status" let-value>
      <span ui-badge [variant]="variants[value]">{{ value }}</span>
    </ng-template>
    <ng-template uiCell="actions" let-row="row">
      <button ui-button variant="outline" size="sm" type="button">Ver {{ row.id }}</button>
    </ng-template>
  </ui-data-table>
`;

export const Default: Story = {
  render: () => ({
    props: { data: ORDERS, columns: COLUMNS, loading: false, variants: STATUS_VARIANT },
    template: TEMPLATE,
  }),
};

export const Loading: Story = {
  render: () => ({
    props: { data: [], columns: COLUMNS, loading: true, variants: STATUS_VARIANT },
    template: TEMPLATE,
  }),
};

export const Empty: Story = {
  render: () => ({
    props: { data: [], columns: COLUMNS, loading: false, variants: STATUS_VARIANT },
    template: TEMPLATE,
  }),
};
