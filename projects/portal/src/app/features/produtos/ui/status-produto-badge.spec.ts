import { render, screen } from '@testing-library/angular';
import { type StatusProduto } from '../models/produto.model';
import { StatusProdutoBadge } from './status-produto-badge';

describe('StatusProdutoBadge', () => {
  const casos: [StatusProduto, string, string][] = [
    ['disponivel', 'Disponível', 'default'],
    ['baixo', 'Estoque baixo', 'secondary'],
    ['esgotado', 'Esgotado', 'destructive'],
  ];

  it.each(casos)('status "%s" mostra "%s" com a cor certa', async (status, rotulo, variante) => {
    await render(StatusProdutoBadge, { inputs: { status } });
    expect(screen.getByText(rotulo)).toHaveAttribute('data-variant', variante);
  });

  it('atualiza quando o status muda', async () => {
    const { rerender } = await render(StatusProdutoBadge, { inputs: { status: 'disponivel' } });
    await rerender({ inputs: { status: 'esgotado' }, partialUpdate: true });
    expect(screen.getByText('Esgotado')).toBeInTheDocument();
    expect(screen.queryByText('Disponível')).not.toBeInTheDocument();
  });
});
