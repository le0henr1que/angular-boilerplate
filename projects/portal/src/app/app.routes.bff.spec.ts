import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Auth } from '@core/auth/auth';
import { AuthGateway } from '@core/auth/gateways/auth-gateway';
import { type Papel } from '@core/auth/usuario';
import { ProdutosApi } from '@features/produtos';
import { PRODUTOS_TESTE } from '@testing/produtos.fixture';
import { provideLocalePtBr } from '@testing/locale';
import { provideTestAppConfig, TEST_APP_CONFIG } from '@testing/test-config';
import { provideTestQueryClient } from '@testing/test-query-client';
import { screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { routes } from './app.routes';

/**
 * Produção (auth.modo = 'bff', Azure AD): não existe tela de login no app.
 * Quem não está logado vai direto para o backend (que leva à Microsoft).
 */
describe('Rotas do app com login do backend (bff)', () => {
  const url = () => TestBed.inject(Router).url;
  const gateway = { buscarUsuario: vi.fn(), entrar: vi.fn(), sair: vi.fn() };

  async function iniciar(papel: Papel | null) {
    const usuario = papel ? { id: '1', nome: 'Teste', email: 't@x', papeis: [papel] } : null;
    gateway.buscarUsuario.mockResolvedValue(usuario);
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig({
          auth: { ...TEST_APP_CONFIG.auth, modo: 'bff' },
          features: { autenticacao: true },
        }),
        provideTestQueryClient(),
        provideLocalePtBr(),
        { provide: AuthGateway, useValue: gateway },
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

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('sem sessão, vai direto para o login do backend guardando o destino', async () => {
    const harness = await iniciar(null);
    // A navegação fica parada de propósito (a página está saindo), por isso não há await.
    void harness.navigateByUrl('/produtos?q=arroz');
    await vi.waitFor(() => expect(gateway.entrar).toHaveBeenCalledWith('/produtos?q=arroz'));
    expect(
      screen.queryByRole('heading', { name: 'Página não encontrada' }),
    ).not.toBeInTheDocument();
    // O App usa isto para manter o carregamento global até a página sair (sem "piscar").
    expect(TestBed.inject(Auth).saindoDoApp()).toBe(true);
  });

  it('o logout na Microsoft também marca a saída da página', async () => {
    await iniciar('operador');
    expect(TestBed.inject(Auth).saindoDoApp()).toBe(false);
    void TestBed.inject(Auth).sair();
    expect(TestBed.inject(Auth).saindoDoApp()).toBe(true);
    expect(gateway.sair).toHaveBeenCalled();
  });

  it('voltou do login sem sessão logo depois de tentar: mostra o erro em vez de entrar em loop', async () => {
    sessionStorage.setItem('supermercado.login.tentativa', String(Date.now()));
    const harness = await iniciar(null);
    await harness.navigateByUrl('/produtos');
    expect(url()).toBe('/erro-login?voltarPara=%2Fprodutos');
    expect(gateway.entrar).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(gateway.entrar).toHaveBeenCalledWith('/produtos');
  });

  it('a última tentativa foi há tempo: tenta o login de novo normalmente', async () => {
    sessionStorage.setItem('supermercado.login.tentativa', String(Date.now() - 60_000));
    const harness = await iniciar(null);
    void harness.navigateByUrl('/produtos');
    await vi.waitFor(() => expect(gateway.entrar).toHaveBeenCalledWith('/produtos'));
  });

  it('/saiu (destino do logout) é pública e não loga de novo sozinha', async () => {
    const harness = await iniciar(null);
    await harness.navigateByUrl('/saiu');
    expect(screen.getByRole('heading', { name: 'Você saiu' })).toBeInTheDocument();
    expect(gateway.entrar).not.toHaveBeenCalled();
  });

  it('/login não existe: logado vai para o início', async () => {
    const harness = await iniciar('operador');
    await harness.navigateByUrl('/login');
    expect(url()).toBe('/inicio');
  });

  it('logado, as páginas de sessão devolvem para o início', async () => {
    const harness = await iniciar('operador');
    await harness.navigateByUrl('/saiu');
    expect(url()).toBe('/inicio');
  });

  it('sessão expirada (401) vai direto para o login do backend', async () => {
    const harness = await iniciar('operador');
    await harness.navigateByUrl('/produtos');
    TestBed.inject(Auth).sessaoExpirou();
    expect(gateway.entrar).toHaveBeenCalledWith('/produtos');
  });
});
