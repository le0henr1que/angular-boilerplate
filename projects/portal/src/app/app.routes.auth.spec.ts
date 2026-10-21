import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Auth } from '@core/auth/auth';
import { AuthGateway } from '@core/auth/gateways/auth-gateway';
import { type Papel } from '@core/auth/usuario';
import { type FeatureFlags } from '@core/config/feature-flags';
import { ProdutosApi } from '@features/produtos';
import { PRODUTOS_TESTE } from '@testing/produtos.fixture';
import { provideLocalePtBr } from '@testing/locale';
import { provideTestAppConfig } from '@testing/test-config';
import { provideTestQueryClient } from '@testing/test-query-client';
import { screen } from '@testing-library/angular';
import { routes } from './app.routes';

/** Gates de verdade: rotas reais + Auth real. Só quem responde "quem está logado" é falso. */
describe('Rotas do app com autenticação', () => {
  const url = () => TestBed.inject(Router).url;

  async function iniciar(papel: Papel | null, features: Partial<FeatureFlags> = {}) {
    const usuario = papel ? { id: '1', nome: 'Teste', email: 't@x', papeis: [papel] } : null;
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig({ features: { autenticacao: true, ...features } }),
        provideTestQueryClient(),
        provideLocalePtBr(),
        { provide: AuthGateway, useValue: { buscarUsuario: () => Promise.resolve(usuario) } },
        {
          provide: ProdutosApi,
          useValue: { listar: vi.fn().mockResolvedValue(PRODUTOS_TESTE), buscar: vi.fn() },
        },
        provideRouter(routes, withComponentInputBinding()),
      ],
    });
    await TestBed.inject(Auth).carregarSessao(); // o que o provideAuth() faz no app
    return RouterTestingHarness.create();
  }

  it('sem sessão, qualquer tela manda para o login guardando o destino', async () => {
    const harness = await iniciar(null);
    await harness.navigateByUrl('/produtos?q=arroz');
    expect(url()).toBe('/login?voltarPara=%2Fprodutos%3Fq%3Darroz');
    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('logado, a tela de login devolve para o início', async () => {
    const harness = await iniciar('operador');
    await harness.navigateByUrl('/login');
    expect(url()).toBe('/inicio');
  });

  it('sem o papel admin, /admin vai para /sem-permissao', async () => {
    const harness = await iniciar('cliente');
    await harness.navigateByUrl('/admin');
    expect(url()).toBe('/sem-permissao');
  });

  it('admin entra em /admin', async () => {
    const harness = await iniciar('admin');
    await harness.navigateByUrl('/admin');
    expect(await screen.findByRole('heading', { name: 'Administração' })).toBeInTheDocument();
  });

  it('flag areaAdmin desligada: /admin não existe nem para o admin', async () => {
    const harness = await iniciar('admin', { areaAdmin: false });
    await harness.navigateByUrl('/admin');
    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument();
  });

  it('flag controleDePapeis desligada: qualquer logado entra em /admin', async () => {
    const harness = await iniciar('cliente', { controleDePapeis: false });
    await harness.navigateByUrl('/admin');
    expect(url()).toBe('/admin');
  });

  it('flag autenticacao desligada: app aberto e /login some', async () => {
    const harness = await iniciar(null, { autenticacao: false });
    await harness.navigateByUrl('/produtos');
    expect(url()).toBe('/produtos');
    await harness.navigateByUrl('/login');
    expect(url()).toBe('/inicio');
  });
});
