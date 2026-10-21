import { UiBadge } from '@supermercado/ui/badge';
import { type Meta, type StoryObj, argsToTemplate, moduleMetadata } from '@storybook/angular';

const meta: Meta<UiBadge> = {
  title: 'Componentes/Badge',
  component: UiBadge,
  decorators: [moduleMetadata({ imports: [UiBadge] })],
  args: { variant: 'default' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'secondary', 'destructive', 'outline'] },
  },
  render: (args) => ({
    props: args,
    template: `<span ui-badge ${argsToTemplate(args)}>Disponível</span>`,
  }),
};

export default meta;
type Story = StoryObj<UiBadge>;

export const Default: Story = {};

export const Variantes: Story = {
  render: () => ({
    template: `
      <div class="sb-linha">
        <span ui-badge>Disponível</span>
        <span ui-badge variant="secondary">Estoque baixo</span>
        <span ui-badge variant="destructive">Esgotado</span>
        <span ui-badge variant="outline">Rascunho</span>
      </div>
    `,
  }),
};
