import { UiSkeleton } from '@supermercado/ui/skeleton';
import { UiSpinner } from '@supermercado/ui/spinner';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular';

/** Indicadores de carregamento: spinner (busca em andamento) e skeleton (conteúdo a caminho). */
const meta: Meta<UiSpinner> = {
  title: 'Componentes/Carregando',
  component: UiSpinner,
  decorators: [moduleMetadata({ imports: [UiSpinner, UiSkeleton] })],
};

export default meta;
type Story = StoryObj<UiSpinner>;

export const Spinner: Story = {
  render: () => ({
    template: `
      <div class="sb-linha">
        <ui-spinner aria-label="Carregando" />
        <ui-spinner aria-label="Carregando" style="font-size: 2rem" />
        <ui-spinner aria-label="Carregando" style="font-size: 2rem; color: var(--destructive)" />
      </div>
    `,
  }),
};

export const Skeleton: Story = {
  render: () => ({
    template: `
      <div class="sb-coluna" aria-busy="true" aria-label="Carregando">
        <ui-skeleton style="width: 12rem; height: 1.75rem" />
        <ui-skeleton style="width: 16rem" />
        <ui-skeleton style="height: 2.5rem" />
        <ui-skeleton style="height: 2.5rem" />
      </div>
    `,
  }),
};
