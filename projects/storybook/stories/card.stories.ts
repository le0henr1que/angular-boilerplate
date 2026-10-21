import { UiBadge } from '@supermercado/ui/badge';
import { UiButton } from '@supermercado/ui/button';
import { UiCard, UiCardImports } from '@supermercado/ui/card';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular';

const meta: Meta<UiCard> = {
  title: 'Componentes/Card',
  component: UiCard,
  decorators: [moduleMetadata({ imports: [UiCardImports, UiButton, UiBadge] })],
};

export default meta;
type Story = StoryObj<UiCard>;

export const Completo: Story = {
  render: () => ({
    template: `
      <article ui-card style="max-width: 24rem">
        <header ui-card-header>
          <h2 ui-card-title>HO-1001</h2>
          <p ui-card-description>Hortifruti · Banana prata (kg)</p>
          <div ui-card-action><span ui-badge>Disponível</span></div>
        </header>
        <div ui-card-content>
          <p>Fabricado em 01/01/2026, válido até 08/01/2026.</p>
        </div>
        <footer ui-card-footer>
          <button ui-button>Ver detalhes</button>
          <button ui-button variant="ghost">Compartilhar</button>
        </footer>
      </article>
    `,
  }),
};

export const SoCabecalho: Story = {
  render: () => ({
    template: `
      <article ui-card style="max-width: 14rem">
        <header ui-card-header>
          <p ui-card-description>Total</p>
          <p ui-card-title style="font-size: var(--text-3xl)">42</p>
        </header>
      </article>
    `,
  }),
};
