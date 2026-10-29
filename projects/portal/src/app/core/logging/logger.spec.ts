import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTestAppConfig } from '@testing/test-config';
import { type LogLevel } from './logging.enums';
import { LogErrorHandler } from './log-error-handler';
import { LOG_TARGETS } from './logging.tokens';
import { Logger } from './logger';
import { type LogRecord } from './logging.types';
import { mask } from './logging.utils';
import { SAVED_LEVEL_KEY } from './logging.constants';

describe('Logger', () => {
  let records: LogRecord[];

  function configure(level: LogLevel | 'off') {
    records = [];
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig({ log: { level, remote: null } }),
        {
          provide: LOG_TARGETS,
          multi: true,
          useValue: { write: (r: LogRecord) => records.push(r) },
        },
        { provide: ErrorHandler, useClass: LogErrorHandler },
      ],
    });
    return TestBed.inject(Logger);
  }

  afterEach(() => localStorage.clear());

  it('records only from the configured level up', () => {
    const log = configure('warn').withContext('test');
    log.debug('d');
    log.info('i');
    log.warn('w');
    log.error('e');
    expect(records.map((r) => r.level)).toEqual(['warn', 'error']);
    expect(records[0]).toMatchObject({ context: 'test', message: 'w' });
  });

  it("'off' records nothing", () => {
    configure('off').withContext('test').error('e');
    expect(records).toEqual([]);
  });

  it('masks sensitive fields without changing the original', () => {
    const data = { user: 'ana', password: '123', profile: { token: 'abc', role: 'admin' } };
    configure('debug').withContext('test').info('login', data);
    expect(records[0].data).toEqual({
      user: 'ana',
      password: '***',
      profile: { token: '***', role: 'admin' },
    });
    expect(data.password).toBe('123');
    expect(mask([{ Authorization: 'Bearer x' }])).toEqual([{ Authorization: '***' }]);
  });

  it('an error becomes { name, message, stack } and keeps the original for the console', () => {
    const error = new TypeError('broke');
    configure('debug').withContext('test').error('failed', error);
    expect(records[0].error).toMatchObject({ name: 'TypeError', message: 'broke' });
    expect(records[0].original).toBe(error);
  });

  it('the level changes at runtime and survives F5 (localStorage)', () => {
    const logger = configure('warn');
    logger.setLevel('debug');
    logger.withContext('test').debug('now it shows');
    expect(records).toHaveLength(1);
    expect(localStorage.getItem(SAVED_LEVEL_KEY)).toBe('debug');

    logger.setLevel(null);
    expect(logger.level()).toBe('warn');
    expect(localStorage.getItem(SAVED_LEVEL_KEY)).toBeNull();
  });

  it('a broken target does not stop the others', () => {
    records = [];
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig(),
        {
          provide: LOG_TARGETS,
          multi: true,
          useValue: {
            write: () => {
              throw new Error('x');
            },
          },
        },
        {
          provide: LOG_TARGETS,
          multi: true,
          useValue: { write: (r: LogRecord) => records.push(r) },
        },
      ],
    });
    TestBed.inject(Logger).withContext('test').error('e');
    expect(records).toHaveLength(1);
  });

  it('an unhandled error goes through the Logger', () => {
    configure('debug');
    TestBed.inject(ErrorHandler).handleError(new Error('boom'));
    expect(records[0]).toMatchObject({ level: 'error', context: 'error' });
  });
});
