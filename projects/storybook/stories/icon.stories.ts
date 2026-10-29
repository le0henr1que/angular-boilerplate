import { ICONS, type IconName, UiIcon } from '@supermercado/ui/icon';
import { type Meta, type StoryObj, argsToTemplate, moduleMetadata } from '@storybook/angular';

const NAMES = Object.keys(ICONS) as IconName[];

const meta: Meta<UiIcon> = {
  title: 'Components/Icon',
  component: UiIcon,
  decorators: [moduleMetadata({ imports: [UiIcon] })],
  args: { name: 'search' },
  argTypes: { name: { control: 'select', options: NAMES } },
  render: (args) => ({
    props: args,
    template: `<ui-icon ${argsToTemplate(args)} style="font-size: 2rem" />`,
  }),
};

export default meta;
type Story = StoryObj<UiIcon>;

export const Default: Story = {};

/** Every hand-drawn icon (projects/ui/icon/src/lib/icons.ts). */
export const All: Story = {
  render: () => ({
    props: { names: NAMES },
    template: `
      <div class="sb-row" style="gap: 1.5rem">
        @for (name of names; track name) {
          <figure style="display: grid; justify-items: center; gap: 0.5rem; margin: 0">
            <ui-icon [name]="name" style="font-size: 1.5rem" />
            <figcaption style="font-size: var(--text-xs); color: var(--muted-foreground)">{{ name }}</figcaption>
          </figure>
        }
      </div>
    `,
  }),
};
