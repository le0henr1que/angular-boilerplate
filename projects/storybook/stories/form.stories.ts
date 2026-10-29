import { UiIcon } from '@supermercado/ui/icon';
import { UiInput, UiInputImports } from '@supermercado/ui/input';
import { UiLabel } from '@supermercado/ui/label';
import { UiSelect } from '@supermercado/ui/select';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular';

/** Form fields: label, input, input group and select. All of them are native elements. */
const meta: Meta<UiInput> = {
  title: 'Components/Form',
  component: UiInput,
  decorators: [moduleMetadata({ imports: [UiInputImports, UiLabel, UiSelect, UiIcon] })],
};

export default meta;
type Story = StoryObj<UiInput>;

export const Input: Story = {
  render: () => ({
    template: `
      <div class="sb-coluna">
        <label ui-label for="name">Nome</label>
        <input ui-input id="name" placeholder="Banana prata (kg)" />
      </div>
    `,
  }),
};

export const InvalidInput: Story = {
  render: () => ({
    template: `
      <div class="sb-coluna">
        <label ui-label for="email">E-mail</label>
        <input ui-input id="email" value="ana@" aria-invalid="true" />
      </div>
    `,
  }),
};

export const InputGroup: Story = {
  render: () => ({
    template: `
      <div class="sb-coluna">
        <label ui-label for="search">Pesquisar</label>
        <div ui-input-group>
          <span ui-input-group-addon><ui-icon name="search" /></span>
          <input ui-input-group-input id="search" type="search" placeholder="Ex.: HO-1001" />
        </div>
      </div>
    `,
  }),
};

export const Select: Story = {
  render: () => ({
    template: `
      <div class="sb-coluna">
        <label ui-label for="status">Status</label>
        <select ui-select id="status">
          <option value="all">Todos</option>
          <option value="available">Disponível</option>
          <option value="low">Estoque baixo</option>
          <option value="out-of-stock">Esgotado</option>
        </select>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    template: `
      <div class="sb-coluna">
        <input ui-input placeholder="Campo desabilitado" disabled aria-label="Campo desabilitado" />
        <select ui-select disabled aria-label="Lista desabilitada"><option>Indisponível</option></select>
      </div>
    `,
  }),
};
