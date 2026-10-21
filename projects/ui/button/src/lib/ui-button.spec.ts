import { render, screen } from '@testing-library/angular';
import { UiButton } from './ui-button';

describe('UiButton', () => {
  it('usa as variantes padrão', async () => {
    await render(`<button ui-button>Salvar</button>`, { imports: [UiButton] });
    const botao = screen.getByRole('button', { name: 'Salvar' });
    expect(botao).toHaveAttribute('data-variant', 'default');
    expect(botao).toHaveAttribute('data-size', 'default');
  });

  it('reflete variant e size em atributos data-*', async () => {
    await render(`<a ui-button href="/x" variant="outline" size="sm">Ir</a>`, {
      imports: [UiButton],
    });
    const link = screen.getByRole('link', { name: 'Ir' });
    expect(link).toHaveAttribute('data-variant', 'outline');
    expect(link).toHaveAttribute('data-size', 'sm');
  });
});
