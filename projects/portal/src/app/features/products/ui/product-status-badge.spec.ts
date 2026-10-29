import { render, screen } from '@testing-library/angular';
import { type ProductStatus } from '../models/product.enums';
import { ProductStatusBadge } from './product-status-badge';

describe('ProductStatusBadge', () => {
  const cases: [ProductStatus, string, string][] = [
    ['available', 'Disponível', 'default'],
    ['low', 'Estoque baixo', 'secondary'],
    ['out-of-stock', 'Esgotado', 'destructive'],
  ];

  it.each(cases)('status "%s" shows "%s" with the right color', async (status, label, variant) => {
    await render(ProductStatusBadge, { inputs: { status } });
    expect(screen.getByText(label)).toHaveAttribute('data-variant', variant);
  });

  it('updates when the status changes', async () => {
    const { rerender } = await render(ProductStatusBadge, { inputs: { status: 'available' } });
    await rerender({ inputs: { status: 'out-of-stock' }, partialUpdate: true });
    expect(screen.getByText('Esgotado')).toBeInTheDocument();
    expect(screen.queryByText('Disponível')).not.toBeInTheDocument();
  });
});
