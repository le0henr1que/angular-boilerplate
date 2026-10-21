import { UiBadge } from '@supermercado/ui/badge';
import { UiTable, UiTableImports } from '@supermercado/ui/table';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular';

const PRODUTOS = [
  {
    codigo: 'HO-1',
    nome: 'Banana prata (kg)',
    categoria: 'Hortifruti',
    preco: 'R$ 7,99',
    status: 'Disponível',
  },
  {
    codigo: 'BE-2',
    nome: 'Suco de laranja 1 L',
    categoria: 'Bebidas',
    preco: 'R$ 9,80',
    status: 'Estoque baixo',
  },
  {
    codigo: 'PA-3',
    nome: 'Pão de forma integral',
    categoria: 'Padaria',
    preco: 'R$ 12,50',
    status: 'Esgotado',
  },
];

const meta: Meta<UiTable> = {
  title: 'Componentes/Table',
  component: UiTable,
  decorators: [moduleMetadata({ imports: [UiTableImports, UiBadge] })],
};

export default meta;
type Story = StoryObj<UiTable>;

export const Default: Story = {
  render: () => ({
    props: { produtos: PRODUTOS },
    template: `
      <div ui-table-container>
        <table ui-table>
          <thead ui-thead>
            <tr ui-tr>
              <th ui-th>Código</th>
              <th ui-th>Nome</th>
              <th ui-th>Categoria</th>
              <th ui-th style="text-align: right">Preço</th>
              <th ui-th>Status</th>
            </tr>
          </thead>
          <tbody ui-tbody>
            @for (produto of produtos; track produto.codigo) {
              <tr ui-tr>
                <td ui-td>{{ produto.codigo }}</td>
                <td ui-td>{{ produto.nome }}</td>
                <td ui-td>{{ produto.categoria }}</td>
                <td ui-td style="text-align: right">{{ produto.preco }}</td>
                <td ui-td><span ui-badge variant="outline">{{ produto.status }}</span></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    `,
  }),
};
