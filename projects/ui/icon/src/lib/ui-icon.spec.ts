import { render } from '@testing-library/angular';
import { ICONES } from './icones';
import { UiIcon } from './ui-icon';

describe('UiIcon', () => {
  it('desenha um <path> para cada caminho do ícone', async () => {
    const { container } = await render(UiIcon, { inputs: { name: 'search' } });
    expect(container.querySelectorAll('path')).toHaveLength(ICONES.search.length);
  });

  it('é decorativo: fica escondido de leitores de tela', async () => {
    const { fixture } = await render(UiIcon, { inputs: { name: 'sun' } });
    expect(fixture.nativeElement).toHaveAttribute('aria-hidden', 'true');
  });
});
