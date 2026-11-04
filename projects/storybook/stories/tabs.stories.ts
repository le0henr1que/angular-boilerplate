import { UiTabs, UiTabsImports } from '@supermercado/ui/tabs';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular';

const meta: Meta<UiTabs> = {
  title: 'Components/Tabs',
  component: UiTabs,
  decorators: [moduleMetadata({ imports: [UiTabsImports] })],
};

export default meta;
type Story = StoryObj<UiTabs>;

/** In the app the links use routerLinkActive + ariaCurrentWhenActive="page". */
export const Navigation: Story = {
  render: () => ({
    template: `
      <nav ui-tabs aria-label="Cadastros">
        <a ui-tab href="#" aria-current="page">Fornecedores</a>
        <a ui-tab href="#">Categorias</a>
      </nav>
    `,
  }),
};
