import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import NotFoundPage from './not-found-page';

describe('NotFoundPage', () => {
  it('explains the problem and offers the way back', async () => {
    await render(NotFoundPage, { providers: [provideRouter([])] });
    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para o início' })).toHaveAttribute('href', '/');
  });
});
