import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideTestAppConfig } from '@testing/test-config';
import { firstValueFrom } from 'rxjs';
import { LOG_DESTINOS, type RegistroLog } from '../logger';
import { CABECALHO_CORRELACAO, logInterceptor, STATUS_ESPERADOS } from './log.interceptor';

describe('logInterceptor', () => {
  let registros: RegistroLog[];
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    registros = [];
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig(),
        provideHttpClient(withInterceptors([logInterceptor])),
        provideHttpClientTesting(),
        {
          provide: LOG_DESTINOS,
          multi: true,
          useValue: { registrar: (r: RegistroLog) => registros.push(r) },
        },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  /** Faz a chamada, responde com o status e devolve o registro de log gerado. */
  async function chamar(url: string, status: number, context?: HttpContext) {
    const resposta = firstValueFrom(http.get(url, { context })).catch(() => undefined);
    const req = backend.expectOne(url);
    req.flush(status < 400 ? {} : null, { status, statusText: 'x' });
    await resposta;
    return { req: req.request, registro: registros.at(-1)! };
  }

  it('sucesso: debug com método, url, status e duração', async () => {
    const { registro } = await chamar('/api/produtos', 200);
    expect(registro).toMatchObject({ nivel: 'debug', contexto: 'http' });
    expect(registro.mensagem).toMatch(/^GET \/api\/produtos → 200 \(\d+ ms\)$/);
  });

  it('4xx é warn, 5xx é error', async () => {
    expect((await chamar('/api/a', 404)).registro.nivel).toBe('warn');
    expect((await chamar('/api/b', 503)).registro.nivel).toBe('error');
  });

  it('status esperado pela chamada vira debug', async () => {
    const context = new HttpContext().set(STATUS_ESPERADOS, [401]);
    expect((await chamar('/bff/user', 401, context)).registro.nivel).toBe('debug');
  });

  it('manda o X-Correlation-Id no mesmo domínio e loga o mesmo id', async () => {
    const { req, registro } = await chamar('/api/produtos', 200);
    const id = req.headers.get(CABECALHO_CORRELACAO);
    expect(id).toBeTruthy();
    expect(registro.dados).toMatchObject({ correlacao: id });
  });

  it('não manda o header para outro domínio (evita CORS)', async () => {
    const { req } = await chamar('https://viacep.com.br/ws/01001000/json/', 200);
    expect(req.headers.has(CABECALHO_CORRELACAO)).toBe(false);
  });
});
