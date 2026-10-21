import { UiAlert, UiAlertImports } from '@supermercado/ui/alert';
import { UiButton } from '@supermercado/ui/button';
import { UiIcon } from '@supermercado/ui/icon';
import { type Meta, type StoryObj, argsToTemplate, moduleMetadata } from '@storybook/angular';

const meta: Meta<UiAlert> = {
  title: 'Componentes/Alert',
  component: UiAlert,
  decorators: [moduleMetadata({ imports: [UiAlertImports, UiIcon, UiButton] })],
  args: { variant: 'default' },
  argTypes: { variant: { control: 'select', options: ['default', 'destructive'] } },
  render: (args) => ({
    props: args,
    template: `
      <div ui-alert ${argsToTemplate(args)} style="max-width: 32rem">
        <ui-icon name="circle-alert" />
        <h2 ui-alert-title>Atenção</h2>
        <p ui-alert-description>Sua sessão vai expirar em 5 minutos.</p>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<UiAlert>;

export const Default: Story = {};

export const Erro: Story = {
  render: () => ({
    template: `
      <div ui-alert variant="destructive" style="max-width: 32rem">
        <ui-icon name="circle-alert" />
        <h2 ui-alert-title>Não foi possível carregar os produtos</h2>
        <div ui-alert-description>
          <p>Verifique sua conexão e tente de novo.</p>
          <button ui-button variant="outline" size="sm" style="margin-top: 0.5rem">Tentar de novo</button>
        </div>
      </div>
    `,
  }),
};

export const SemIcone: Story = {
  render: () => ({
    template: `
      <div ui-alert style="max-width: 32rem">
        <h2 ui-alert-title>Dica</h2>
        <p ui-alert-description>Você pode pesquisar pelo código do produto.</p>
      </div>
    `,
  }),
};
