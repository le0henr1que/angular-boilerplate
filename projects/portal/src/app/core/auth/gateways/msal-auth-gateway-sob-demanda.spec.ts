import { TestBed } from '@angular/core/testing';
import { CarregadorMsal } from '../msal/carregador-msal';
import { MsalAuthGatewaySobDemanda } from './msal-auth-gateway-sob-demanda';

describe('MsalAuthGatewaySobDemanda (MSAL fora do bundle inicial)', () => {
  const usuario = { id: 'u-1', nome: 'Ana', email: 'ana@exemplo.com', papeis: [] };
  const real = {
    buscarUsuario: vi.fn(() => Promise.resolve(usuario)),
    entrar: vi.fn(() => Promise.resolve()),
    sair: vi.fn(() => Promise.resolve()),
  };
  const MsalAuthGateway = class {};
  const carregar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    carregar.mockResolvedValue({
      chunk: { MsalAuthGateway },
      injector: { get: (token: unknown) => (token === MsalAuthGateway ? real : null) },
    });
    TestBed.configureTestingModule({
      providers: [{ provide: CarregadorMsal, useValue: { carregar } }],
    });
  });

  const gateway = () => TestBed.inject(MsalAuthGatewaySobDemanda);

  it('carrega o MSAL e repassa cada chamada para o gateway de verdade', async () => {
    expect(await gateway().buscarUsuario()).toEqual(usuario);
    await gateway().entrar('/produtos');
    await gateway().sair();

    expect(real.entrar).toHaveBeenCalledWith('/produtos');
    expect(real.sair).toHaveBeenCalled();
    expect(carregar).toHaveBeenCalledTimes(3); // o CarregadorMsal reaproveita o chunk
  });

  it('chunk não baixou (rede, deploy novo): trata como não logado, sem quebrar o app', async () => {
    carregar.mockRejectedValueOnce(new Error('Failed to fetch dynamically imported module'));
    expect(await gateway().buscarUsuario()).toBeNull();
    expect(real.buscarUsuario).not.toHaveBeenCalled();
  });
});

describe('CarregadorMsal', () => {
  it('baixa o chunk uma vez e monta o MsalAuthGateway com o MSAL no injector filho', async () => {
    const { provideTestAppConfig, TEST_APP_CONFIG } = await import('@testing/test-config');
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig({
          auth: {
            ...TEST_APP_CONFIG.auth,
            modo: 'msal',
            msal: {
              clientId: '00000000-0000-0000-0000-000000000000',
              authority: 'https://login.microsoftonline.com/common',
              redirectUri: '/',
              apis: [],
              cache: 'sessionStorage',
            },
          },
        }),
      ],
    });
    const carregador = TestBed.inject(CarregadorMsal);

    const primeiro = await carregador.carregar();
    expect(await carregador.carregar()).toBe(primeiro);
    expect(primeiro.injector.get(primeiro.chunk.MsalAuthGateway)).toBeInstanceOf(
      primeiro.chunk.MsalAuthGateway,
    );
  });
});
