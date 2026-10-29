import { render, screen } from '@testing-library/angular';
import { UiButton } from './ui-button';

describe('UiButton', () => {
  it('uses the default variants', async () => {
    await render(`<button ui-button>Salvar</button>`, { imports: [UiButton] });
    const button = screen.getByRole('button', { name: 'Salvar' });
    expect(button).toHaveAttribute('data-variant', 'default');
    expect(button).toHaveAttribute('data-size', 'default');
  });

  it('reflects variant and size as data-* attributes', async () => {
    await render(`<a ui-button href="/x" variant="outline" size="sm">Ir</a>`, {
      imports: [UiButton],
    });
    const link = screen.getByRole('link', { name: 'Ir' });
    expect(link).toHaveAttribute('data-variant', 'outline');
    expect(link).toHaveAttribute('data-size', 'sm');
  });
});
