import { type LogLevel } from '../logging.enums';
import { type LogRecord } from '../logging.types';
import { RemoteTarget } from './remote.target';
import { BATCH_SIZE, FLUSH_INTERVAL_MS } from './remote.target.constants';

const record = (level: LogLevel, message = 'm'): LogRecord => ({
  level,
  context: 'test',
  message,
  timestamp: '2026-01-01T00:00:00.000Z',
  session: 's',
  route: '/',
  original: new Error('not sent to the backend'),
});

describe('RemoteTarget (sending to the backend)', () => {
  const fakeFetch = vi.fn(() => Promise.resolve(new Response()));

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', fakeFetch);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    fakeFetch.mockClear();
  });

  const sent = (call = 0) =>
    JSON.parse((fakeFetch.mock.calls[call] as unknown as [string, RequestInit])[1].body as string);

  it('ignores what is below the minimum level', () => {
    const target = new RemoteTarget('/api/logs', 'warn');
    target.write(record('info'));
    vi.advanceTimersByTime(FLUSH_INTERVAL_MS);
    expect(fakeFetch).not.toHaveBeenCalled();
  });

  it('batches warnings and sends them after the interval, without the original error', () => {
    const target = new RemoteTarget('/api/logs', 'warn', { 'X-CSRF': '1' });
    target.write(record('warn', 'a'));
    target.write(record('warn', 'b'));
    expect(fakeFetch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(FLUSH_INTERVAL_MS);
    expect(fakeFetch).toHaveBeenCalledTimes(1);
    expect(fakeFetch).toHaveBeenCalledWith(
      '/api/logs',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'X-CSRF': '1' }),
      }),
    );
    expect(sent().map((r: LogRecord) => r.message)).toEqual(['a', 'b']);
    expect(sent()[0].original).toBeUndefined();
  });

  it('an error is sent right away', () => {
    new RemoteTarget('/api/logs', 'warn').write(record('error'));
    expect(fakeFetch).toHaveBeenCalledTimes(1);
  });

  it('a full batch is sent right away', () => {
    const target = new RemoteTarget('/api/logs', 'warn');
    for (let i = 0; i < BATCH_SIZE; i++) target.write(record('warn'));
    expect(fakeFetch).toHaveBeenCalledTimes(1);
    expect(sent()).toHaveLength(BATCH_SIZE);
  });

  it('leaving the page sends with keepalive', () => {
    const target = new RemoteTarget('/api/logs', 'warn');
    target.write(record('warn'));
    target.flush(true);
    expect(fakeFetch).toHaveBeenCalledWith(
      '/api/logs',
      expect.objectContaining({ keepalive: true }),
    );
  });
});
