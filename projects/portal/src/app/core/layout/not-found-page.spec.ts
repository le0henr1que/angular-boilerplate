import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import NotFoundPage from './not-found-page';

describe('NotFoundPage', () => {
  it('explica o problema e oferece o caminho de volta', async () => {
    await render(NotFoundPage, { providers: [provideRouter([])] });
    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para o início' })).toHaveAttribute('href', '/');
  });
});
