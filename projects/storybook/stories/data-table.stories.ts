import { UiBadge } from '@supermercado/ui/badge';
import { UiButton } from '@supermercado/ui/button';
import { type UiColuna, UiDataTable, UiDataTableImports } from '@supermercado/ui/data-table';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular';

interface Pedido {
  id: number;
  user: { name: string; email: string };
  total: number;
  status: 'pago' | 'pendente' | 'cancelado';
}

const PEDIDOS: Pedido[] = [
  { id: 101, user: { name: 'Ana Souza', email: 'ana@exemplo.com' }, total: 152.9, status: 'pago' },
  { id: 102, user: { name: 'Bruno Lima', email: 'bruno@exemplo.com' }, total: 48, status: 'pendente' },
  { id: 103, user: { name: 'Carla Dias', email: 'carla@exemplo.com' }, total: 310.4, status: 'cancelado' },
];

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const COLUNAS: UiColuna<Pedido>[] = [
  { chave: 'id', titulo: '#', largura: '4rem' },
  { chave: 'user.name', titulo: 'Cliente' },
  { chave: 'user.email', titulo: 'E-mail' },
  { chave: 'total', titulo: 'Total', formatar: (v) => moeda.format(v), alinhar: 'direita' },
  { chave: 'status', titulo: 'Status' },
  { id: 'acoes', titulo: '', alinhar: 'direita' },
];

const VARIANTE_STATUS = { pago: 'default', pendente: 'secondary', cancelado: 'destructive' };

const meta: Meta<UiDataTable<Pedido>> = {
  title: 'Componentes/Data Table',
  component: UiDataTable,
  decorators: [moduleMetadata({ imports: [UiDataTableImports, UiBadge, UiButton] })],
};

export default meta;
type Story = StoryObj<UiDataTable<Pedido>>;

const TEMPLATE = `
  <ui-data-table [dados]="dados" [colunas]="colunas" [carregando]="carregando">
    <ng-template uiCelula="status" let-valor>
      <span ui-badge [variant]="variantes[valor]">{{ valor }}</span>
    </ng-template>
    <ng-template uiCelula="acoes" let-linha="linha">
      <button ui-button variant="outline" size="sm" type="button">Ver {{ linha.id }}</button>
    </ng-template>
  </ui-data-table>
`;

export const Default: Story = {
  render: () => ({
    props: { dados: PEDIDOS, colunas: COLUNAS, carregando: false, variantes: VARIANTE_STATUS },
    template: TEMPLATE,
  }),
};

export const Carregando: Story = {
  render: () => ({
    props: { dados: [], colunas: COLUNAS, carregando: true, variantes: VARIANTE_STATUS },
    template: TEMPLATE,
  }),
};

export const Vazia: Story = {
  render: () => ({
    props: { dados: [], colunas: COLUNAS, carregando: false, variantes: VARIANTE_STATUS },
    template: TEMPLATE,
  }),
};
