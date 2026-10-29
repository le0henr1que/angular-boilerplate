import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideTestAppConfig } from '@testing/test-config';
import { firstValueFrom } from 'rxjs';
import { LOG_TARGETS } from '../logging.tokens';
import { type LogRecord } from '../logging.types';
import { CORRELATION_HEADER } from '../logging.constants';
import { EXPECTED_STATUSES } from '../logging.tokens';
import { logInterceptor } from './log.interceptor';

describe('logInterceptor', () => {
  let records: LogRecord[];
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    records = [];
    TestBed.configureTestingModule({
      providers: [
        provideTestAppConfig(),
        provideHttpClient(withInterceptors([logInterceptor])),
        provideHttpClientTesting(),
        {
          provide: LOG_TARGETS,
          multi: true,
          useValue: { write: (r: LogRecord) => records.push(r) },
        },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  /** Makes the call, responds with the status and returns the log record it produced. */
  async function call(url: string, status: number, context?: HttpContext) {
    const response = firstValueFrom(http.get(url, { context })).catch(() => undefined);
    const req = backend.expectOne(url);
    req.flush(status < 400 ? {} : null, { status, statusText: 'x' });
    await response;
    return { req: req.request, record: records.at(-1)! };
  }

  it('success: debug with method, url, status and duration', async () => {
    const { record } = await call('/api/produtos', 200);
    expect(record).toMatchObject({ level: 'debug', context: 'http' });
    expect(record.message).toMatch(/^GET \/api\/produtos → 200 \(\d+ ms\)$/);
  });

  it('4xx is warn, 5xx is error', async () => {
    expect((await call('/api/a', 404)).record.level).toBe('warn');
    expect((await call('/api/b', 503)).record.level).toBe('error');
  });

  it('a status expected by the call becomes debug', async () => {
    const context = new HttpContext().set(EXPECTED_STATUSES, [401]);
    expect((await call('/bff/user', 401, context)).record.level).toBe('debug');
  });

  it('sends the X-Correlation-Id on the same domain and logs the same id', async () => {
    const { req, record } = await call('/api/produtos', 200);
    const id = req.headers.get(CORRELATION_HEADER);
    expect(id).toBeTruthy();
    expect(record.data).toMatchObject({ correlationId: id });
  });

  it('does not send the header to another domain (avoids CORS)', async () => {
    const { req } = await call('https://viacep.com.br/ws/01001000/json/', 200);
    expect(req.headers.has(CORRELATION_HEADER)).toBe(false);
  });
});
