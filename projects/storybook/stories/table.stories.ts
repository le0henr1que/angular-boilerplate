import { UiBadge } from '@supermercado/ui/badge';
import { UiTable, UiTableImports } from '@supermercado/ui/table';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular';

const PRODUCTS = [
  {
    code: 'HO-1',
    name: 'Banana prata (kg)',
    category: 'Hortifruti',
    price: 'R$ 7,99',
    status: 'Disponível',
  },
  {
    code: 'BE-2',
    name: 'Suco de laranja 1 L',
    category: 'Bebidas',
    price: 'R$ 9,80',
    status: 'Estoque baixo',
  },
  {
    code: 'PA-3',
    name: 'Pão de forma integral',
    category: 'Padaria',
    price: 'R$ 12,50',
    status: 'Esgotado',
  },
];

const meta: Meta<UiTable> = {
  title: 'Components/Table',
  component: UiTable,
  decorators: [moduleMetadata({ imports: [UiTableImports, UiBadge] })],
};

export default meta;
type Story = StoryObj<UiTable>;

export const Default: Story = {
  render: () => ({
    props: { products: PRODUCTS },
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
            @for (product of products; track product.code) {
              <tr ui-tr>
                <td ui-td>{{ product.code }}</td>
                <td ui-td>{{ product.name }}</td>
                <td ui-td>{{ product.category }}</td>
                <td ui-td style="text-align: right">{{ product.price }}</td>
                <td ui-td><span ui-badge variant="outline">{{ product.status }}</span></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    `,
  }),
};
