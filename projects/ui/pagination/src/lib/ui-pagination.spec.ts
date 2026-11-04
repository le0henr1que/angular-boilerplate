import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { UiPagination } from './ui-pagination';
import { visiblePages } from './ui-pagination.utils';

describe('visiblePages', () => {
  it('shows every page when there are few', () => {
    expect(visiblePages(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it('replaces the hidden blocks with an ellipsis', () => {
    expect(visiblePages(6, 20)).toEqual([1, 'ellipsis', 5, 6, 7, 'ellipsis', 20]);
    expect(visiblePages(1, 20)).toEqual([1, 2, 'ellipsis', 20]);
  });
});

describe('UiPagination', () => {
  async function renderPagination(page: number, totalPages: number) {
    const pageChange = vi.fn();
    await render(UiPagination, {
      inputs: { page, totalPages },
      on: { pageChange },
    });
    return pageChange;
  }

  it('marks the current page and reports the clicked page', async () => {
    const pageChange = await renderPagination(2, 5);
    expect(screen.getByRole('button', { name: 'Página 2' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    // Page 2 of 5: shows 1 2 3 … 5 (page 4 is inside the ellipsis).
    expect(screen.queryByRole('button', { name: 'Página 4' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Página 5' }));
    expect(pageChange).toHaveBeenCalledWith(5);
  });

  it('previous and next report the neighbour page and are disabled at the ends', async () => {
    const pageChange = await renderPagination(1, 3);
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    expect(pageChange).toHaveBeenCalledWith(2);
  });
});

describe('UiPagination (compact)', () => {
  async function renderCompact(page: number, totalPages: number) {
    const pageChange = vi.fn();
    await render(UiPagination, {
      inputs: { page, totalPages, variant: 'compact' },
      on: { pageChange },
    });
    return pageChange;
  }

  it('shows the position instead of the page numbers', async () => {
    await renderCompact(2, 5);
    expect(screen.getByRole('navigation')).toHaveTextContent('Página 2 de 5');
    expect(screen.queryByRole('button', { name: 'Página 2' })).not.toBeInTheDocument();
  });

  it('jumps to the first, previous, next and last page', async () => {
    const pageChange = await renderCompact(3, 5);
    await userEvent.click(screen.getByRole('button', { name: 'Primeira página' }));
    await userEvent.click(screen.getByRole('button', { name: 'Página anterior' }));
    await userEvent.click(screen.getByRole('button', { name: 'Próxima página' }));
    await userEvent.click(screen.getByRole('button', { name: 'Última página' }));
    expect(pageChange.mock.calls).toEqual([[1], [2], [4], [5]]);
  });

  it('disables the buttons at the ends and reads 1 of 1 without results', async () => {
    await renderCompact(1, 0);
    expect(screen.getByRole('navigation')).toHaveTextContent('Página 1 de 1');
    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
  });
});
