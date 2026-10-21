import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTestAppConfig } from '@testing/test-config';
import { type NivelLog } from './log-config';
import { LogErrorHandler } from './log-error-handler';
import { CHAVE_NIVEL_SALVO, LOG_DESTINOS, Logger, mascarar, type RegistroLog } from './logger';

describe('Logger', () => {
  let registros: RegistroLog[];

  function configurar(nivel: NivelLog | 'off') {
    registros = [];
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig({ log: { nivel, remoto: null } }),
        {
          provide: LOG_DESTINOS,
          multi: true,
          useValue: { registrar: (r: RegistroLog) => registros.push(r) },
        },
        { provide: ErrorHandler, useClass: LogErrorHandler },
      ],
    });
    return TestBed.inject(Logger);
  }

  afterEach(() => localStorage.clear());

  it('registra só do nível configurado para cima', () => {
    const log = configurar('warn').com('teste');
    log.debug('d');
    log.info('i');
    log.warn('w');
    log.error('e');
    expect(registros.map((r) => r.nivel)).toEqual(['warn', 'error']);
    expect(registros[0]).toMatchObject({ contexto: 'teste', mensagem: 'w' });
  });

  it("'off' não registra nada", () => {
    configurar('off').com('teste').error('e');
    expect(registros).toEqual([]);
  });

  it('mascara campos sensíveis sem alterar o original', () => {
    const dados = { usuario: 'ana', senha: '123', perfil: { token: 'abc', papel: 'admin' } };
    configurar('debug').com('teste').info('login', dados);
    expect(registros[0].dados).toEqual({
      usuario: 'ana',
      senha: '***',
      perfil: { token: '***', papel: 'admin' },
    });
    expect(dados.senha).toBe('123');
    expect(mascarar([{ Authorization: 'Bearer x' }])).toEqual([{ Authorization: '***' }]);
  });

  it('erro vira { nome, mensagem, stack } e guarda o original para o console', () => {
    const erro = new TypeError('quebrou');
    configurar('debug').com('teste').error('falhou', erro);
    expect(registros[0].erro).toMatchObject({ nome: 'TypeError', mensagem: 'quebrou' });
    expect(registros[0].original).toBe(erro);
  });

  it('nível muda em tempo de execução e sobrevive ao F5 (localStorage)', () => {
    const logger = configurar('warn');
    logger.definirNivel('debug');
    logger.com('teste').debug('agora aparece');
    expect(registros).toHaveLength(1);
    expect(localStorage.getItem(CHAVE_NIVEL_SALVO)).toBe('debug');

    logger.definirNivel(null);
    expect(logger.nivel()).toBe('warn');
    expect(localStorage.getItem(CHAVE_NIVEL_SALVO)).toBeNull();
  });

  it('um destino com defeito não impede os outros', () => {
    registros = [];
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig(),
        {
          provide: LOG_DESTINOS,
          multi: true,
          useValue: {
            registrar: () => {
              throw new Error('x');
            },
          },
        },
        {
          provide: LOG_DESTINOS,
          multi: true,
          useValue: { registrar: (r: RegistroLog) => registros.push(r) },
        },
      ],
    });
    TestBed.inject(Logger).com('teste').error('e');
    expect(registros).toHaveLength(1);
  });

  it('erro não tratado passa pelo Logger', () => {
    configurar('debug');
    TestBed.inject(ErrorHandler).handleError(new Error('boom'));
    expect(registros[0]).toMatchObject({ nivel: 'error', contexto: 'erro' });
  });
});
