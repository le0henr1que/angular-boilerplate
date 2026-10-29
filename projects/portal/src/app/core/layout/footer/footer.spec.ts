import { provideTestAppConfig } from '@testing/test-config';
import { render, screen } from '@testing-library/angular';
import { AppFooter } from './footer';

describe('AppFooter', () => {
  it('shows the app name and the version from the configuration', async () => {
    await render(AppFooter, {
      providers: [provideTestAppConfig({ appName: 'Portal Teste', version: '1.2.3' })],
    });
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Portal Teste');
    expect(screen.getByText('v1.2.3')).toBeInTheDocument();
  });
});
