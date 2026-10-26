import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { paginasVisiveis, UiPagination } from './ui-pagination';

describe('paginasVisiveis', () => {
  it('mostra todas quando são poucas', () => {
    expect(paginasVisiveis(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it('troca os blocos escondidos por reticências', () => {
    expect(paginasVisiveis(6, 20)).toEqual([1, 'reticencias', 5, 6, 7, 'reticencias', 20]);
    expect(paginasVisiveis(1, 20)).toEqual([1, 2, 'reticencias', 20]);
  });
});

describe('UiPagination', () => {
  async function renderizar(pagina: number, totalPaginas: number) {
    const mudarPagina = vi.fn();
    await render(UiPagination, {
      inputs: { pagina, totalPaginas },
      on: { mudarPagina },
    });
    return mudarPagina;
  }

  it('marca a página atual e avisa a página clicada', async () => {
    const mudarPagina = await renderizar(2, 5);
    expect(screen.getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page');
    // Página 2 de 5: aparecem 1 2 3 … 5 (a 4 fica nas reticências).
    expect(screen.queryByRole('button', { name: 'Página 4' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Página 5' }));
    expect(mudarPagina).toHaveBeenCalledWith(5);
  });

  it('anterior e próxima avisam a página vizinha e desabilitam nas pontas', async () => {
    const mudarPagina = await renderizar(1, 3);
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    expect(mudarPagina).toHaveBeenCalledWith(2);
  });
});
