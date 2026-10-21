import { UiIcon } from '@supermercado/ui/icon';
import { UiInput, UiInputImports } from '@supermercado/ui/input';
import { UiLabel } from '@supermercado/ui/label';
import { UiSelect } from '@supermercado/ui/select';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular';

/** Campos de formulário: label, input, input group e select. Todos são elementos nativos. */
const meta: Meta<UiInput> = {
  title: 'Componentes/Formulário',
  component: UiInput,
  decorators: [moduleMetadata({ imports: [UiInputImports, UiLabel, UiSelect, UiIcon] })],
};

export default meta;
type Story = StoryObj<UiInput>;

export const Input: Story = {
  render: () => ({
    template: `
      <div class="sb-coluna">
        <label ui-label for="nome">Nome</label>
        <input ui-input id="nome" placeholder="Banana prata (kg)" />
      </div>
    `,
  }),
};

export const InputInvalido: Story = {
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
        <label ui-label for="busca">Pesquisar</label>
        <div ui-input-group>
          <span ui-input-group-addon><ui-icon name="search" /></span>
          <input ui-input-group-input id="busca" type="search" placeholder="Ex.: HO-1001" />
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
          <option value="todos">Todos</option>
          <option value="disponivel">Disponível</option>
          <option value="baixo">Estoque baixo</option>
          <option value="esgotado">Esgotado</option>
        </select>
      </div>
    `,
  }),
};

export const Desabilitados: Story = {
  render: () => ({
    template: `
      <div class="sb-coluna">
        <input ui-input placeholder="Campo desabilitado" disabled aria-label="Campo desabilitado" />
        <select ui-select disabled aria-label="Lista desabilitada"><option>Indisponível</option></select>
      </div>
    `,
  }),
};
