import { ICONES, type IconName, UiIcon } from '@supermercado/ui/icon';
import { type Meta, type StoryObj, argsToTemplate, moduleMetadata } from '@storybook/angular';

const NOMES = Object.keys(ICONES) as IconName[];

const meta: Meta<UiIcon> = {
  title: 'Componentes/Icon',
  component: UiIcon,
  decorators: [moduleMetadata({ imports: [UiIcon] })],
  args: { name: 'search' },
  argTypes: { name: { control: 'select', options: NOMES } },
  render: (args) => ({
    props: args,
    template: `<ui-icon ${argsToTemplate(args)} style="font-size: 2rem" />`,
  }),
};

export default meta;
type Story = StoryObj<UiIcon>;

export const Default: Story = {};

/** Todos os ícones desenhados à mão (projects/ui/icon/src/lib/icones.ts). */
export const Todos: Story = {
  render: () => ({
    props: { nomes: NOMES },
    template: `
      <div class="sb-linha" style="gap: 1.5rem">
        @for (nome of nomes; track nome) {
          <figure style="display: grid; justify-items: center; gap: 0.5rem; margin: 0">
            <ui-icon [name]="nome" style="font-size: 1.5rem" />
            <figcaption style="font-size: var(--text-xs); color: var(--muted-foreground)">{{ nome }}</figcaption>
          </figure>
        }
      </div>
    `,
  }),
};
