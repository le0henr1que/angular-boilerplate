import { UiButton } from '@supermercado/ui/button';
import { UiIcon } from '@supermercado/ui/icon';
import { type Meta, type StoryObj, argsToTemplate, moduleMetadata } from '@storybook/angular';

const meta: Meta<UiButton> = {
  title: 'Componentes/Button',
  component: UiButton,
  decorators: [moduleMetadata({ imports: [UiButton, UiIcon] })],
  args: { variant: 'default', size: 'default' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
    },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
  },
  render: (args) => ({
    props: args,
    template: `<button ui-button ${argsToTemplate(args)}>Clique aqui</button>`,
  }),
};

export default meta;
type Story = StoryObj<UiButton>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Outline: Story = { args: { variant: 'outline' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Destructive: Story = { args: { variant: 'destructive' } };
export const Link: Story = { args: { variant: 'link' } };

export const Tamanhos: Story = {
  render: () => ({
    template: `
      <div class="sb-linha">
        <button ui-button size="sm">Pequeno</button>
        <button ui-button>Médio</button>
        <button ui-button size="lg">Grande</button>
        <button ui-button size="icon" aria-label="Pesquisar"><ui-icon name="search" /></button>
      </div>
    `,
  }),
};

export const ComIcone: Story = {
  render: () => ({
    template: `
      <div class="sb-linha">
        <button ui-button><ui-icon name="search" /> Pesquisar</button>
        <button ui-button variant="outline">Continuar <ui-icon name="arrow-right" /></button>
      </div>
    `,
  }),
};

export const Desabilitado: Story = {
  render: () => ({
    template: `<button ui-button disabled>Indisponível</button>`,
  }),
};

export const ComoLink: Story = {
  render: () => ({
    template: `<a ui-button variant="outline" href="#">Sou um link com cara de botão</a>`,
  }),
};
