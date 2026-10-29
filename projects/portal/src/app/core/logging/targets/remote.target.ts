import { LEVEL_WEIGHT } from '../logging.constants';
import { type LogLevel } from '../logging.enums';
import { type LogRecord, type LogTarget } from '../logging.types';
import { BATCH_SIZE, FLUSH_INTERVAL_MS, MAX_QUEUED } from './remote.target.constants';

/**
 * Sends records to the backend in batches (POST JSON with an array of LogRecord).
 *
 * - Errors go right away; the rest wait for the batch or the interval.
 * - When closing/switching tabs (`pagehide`) it sends what's left with `keepalive`.
 * - Uses `fetch` directly, without HttpClient: that way the interceptors (including the log one)
 *   don't see this request, and a failure to send logs doesn't generate another log (loop).
 * - A failure to send is ignored: logging can never break the app.
 */
export class RemoteTarget implements LogTarget {
  #queue: Omit<LogRecord, 'original'>[] = [];
  #timer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly url: string,
    private readonly minLevel: LogLevel,
    private readonly headers: Record<string, string> = {},
  ) {}

  write(record: LogRecord): void {
    if (LEVEL_WEIGHT[record.level] < LEVEL_WEIGHT[this.minLevel]) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { original, ...toSend } = record;
    if (this.#queue.length >= MAX_QUEUED) this.#queue.shift();
    this.#queue.push(toSend);

    if (record.level === 'error' || this.#queue.length >= BATCH_SIZE) {
      this.flush();
    } else {
      this.#timer ??= setTimeout(() => this.flush(), FLUSH_INTERVAL_MS);
    }
  }

  /** `leaving`: the page is closing; `keepalive` lets the request finish after that. */
  flush(leaving = false): void {
    clearTimeout(this.#timer);
    this.#timer = undefined;
    if (this.#queue.length === 0) return;

    const batch = this.#queue.splice(0);
    fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.headers },
      body: JSON.stringify(batch),
      credentials: 'same-origin',
      keepalive: leaving,
    }).catch(() => undefined);
  }
}
