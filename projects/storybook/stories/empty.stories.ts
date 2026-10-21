import { UiButton } from '@supermercado/ui/button';
import { UiEmpty, UiEmptyImports } from '@supermercado/ui/empty';
import { UiIcon } from '@supermercado/ui/icon';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular';

const meta: Meta<UiEmpty> = {
  title: 'Componentes/Empty',
  component: UiEmpty,
  decorators: [moduleMetadata({ imports: [UiEmptyImports, UiIcon, UiButton] })],
};

export default meta;
type Story = StoryObj<UiEmpty>;

export const ComIcone: Story = {
  render: () => ({
    template: `
      <div ui-empty style="border: 1px dashed var(--border); border-radius: var(--radius-lg)">
        <div ui-empty-header>
          <div ui-empty-media variant="icon"><ui-icon name="search-x" /></div>
          <h2 ui-empty-title>Nenhum produto encontrado</h2>
          <p ui-empty-description>Tente outro termo ou remova os filtros.</p>
        </div>
        <div ui-empty-content>
          <button ui-button variant="outline">Limpar filtros</button>
        </div>
      </div>
    `,
  }),
};

export const Simples: Story = {
  render: () => ({
    template: `
      <div ui-empty>
        <div ui-empty-header>
          <h2 ui-empty-title>Página não encontrada</h2>
          <p ui-empty-description>O endereço que você abriu não existe.</p>
        </div>
        <div ui-empty-content>
          <a ui-button href="#">Voltar para o início</a>
        </div>
      </div>
    `,
  }),
};
