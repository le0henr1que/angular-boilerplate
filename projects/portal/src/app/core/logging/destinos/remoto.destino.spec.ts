import { type NivelLog } from '../log-config';
import { type RegistroLog } from '../logger';
import { INTERVALO_DE_ENVIO_MS, RemotoDestino, TAMANHO_DO_LOTE } from './remoto.destino';

const registro = (nivel: NivelLog, mensagem = 'm'): RegistroLog => ({
  nivel,
  contexto: 'teste',
  mensagem,
  momento: '2026-01-01T00:00:00.000Z',
  sessao: 's',
  rota: '/',
  original: new Error('não vai ao backend'),
});

describe('RemotoDestino (envio para o backend)', () => {
  const fetchFalso = vi.fn(() => Promise.resolve(new Response()));

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', fetchFalso);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    fetchFalso.mockClear();
  });

  const enviados = (chamada = 0) =>
    JSON.parse(
      (fetchFalso.mock.calls[chamada] as unknown as [string, RequestInit])[1].body as string,
    );

  it('ignora o que está abaixo do nível mínimo', () => {
    const destino = new RemotoDestino('/api/logs', 'warn');
    destino.registrar(registro('info'));
    vi.advanceTimersByTime(INTERVALO_DE_ENVIO_MS);
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it('junta avisos e envia depois do intervalo, sem o erro original', () => {
    const destino = new RemotoDestino('/api/logs', 'warn', { 'X-CSRF': '1' });
    destino.registrar(registro('warn', 'a'));
    destino.registrar(registro('warn', 'b'));
    expect(fetchFalso).not.toHaveBeenCalled();

    vi.advanceTimersByTime(INTERVALO_DE_ENVIO_MS);
    expect(fetchFalso).toHaveBeenCalledTimes(1);
    expect(fetchFalso).toHaveBeenCalledWith(
      '/api/logs',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'X-CSRF': '1' }),
      }),
    );
    expect(enviados().map((r: RegistroLog) => r.mensagem)).toEqual(['a', 'b']);
    expect(enviados()[0].original).toBeUndefined();
  });

  it('erro é enviado na hora', () => {
    new RemotoDestino('/api/logs', 'warn').registrar(registro('error'));
    expect(fetchFalso).toHaveBeenCalledTimes(1);
  });

  it('lote cheio é enviado na hora', () => {
    const destino = new RemotoDestino('/api/logs', 'warn');
    for (let i = 0; i < TAMANHO_DO_LOTE; i++) destino.registrar(registro('warn'));
    expect(fetchFalso).toHaveBeenCalledTimes(1);
    expect(enviados()).toHaveLength(TAMANHO_DO_LOTE);
  });

  it('ao sair da página envia com keepalive', () => {
    const destino = new RemotoDestino('/api/logs', 'warn');
    destino.registrar(registro('warn'));
    destino.enviar(true);
    expect(fetchFalso).toHaveBeenCalledWith(
      '/api/logs',
      expect.objectContaining({ keepalive: true }),
    );
  });
});
