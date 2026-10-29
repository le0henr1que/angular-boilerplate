import { render } from '@testing-library/angular';
import { ICONS } from './icons.constants';
import { UiIcon } from './ui-icon';

describe('UiIcon', () => {
  it('draws one <path> per icon path', async () => {
    const { container } = await render(UiIcon, { inputs: { name: 'search' } });
    expect(container.querySelectorAll('path')).toHaveLength(ICONS.search.length);
  });

  it('is decorative: hidden from screen readers', async () => {
    const { fixture } = await render(UiIcon, { inputs: { name: 'sun' } });
    expect(fixture.nativeElement).toHaveAttribute('aria-hidden', 'true');
  });
});
