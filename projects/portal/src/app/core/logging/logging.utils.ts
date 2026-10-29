import { type SerializedError } from './logging.types';

// Portuguese names too: API data may still use them (senha = password, cartao = card).
const SENSITIVE_FIELD = /senha|password|token|secret|authorization|cookie|cpf|cartao|card/i;
const MAX_DEPTH = 5;
const MASK = '***';

/** Copies the data replacing sensitive field values with '***'. Never changes the original. */
export function mask(value: unknown, depth = 0): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (depth >= MAX_DEPTH) return '[...]';
  if (Array.isArray(value)) return value.map((item) => mask(item, depth + 1));
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_FIELD.test(key) ? MASK : mask(item, depth + 1),
    ]),
  );
}

export function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    const status = (error as Error & { status?: unknown }).status;
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(typeof status === 'number' ? { status } : {}),
    };
  }
  // HttpErrorResponse doesn't extend Error.
  if (typeof error === 'object' && error !== null && 'status' in error && 'message' in error) {
    const { status, message, name } = error as { status: number; message: string; name?: string };
    return { name: name ?? 'HttpErrorResponse', message, status };
  }
  return { name: 'Unknown', message: String(error) };
}

/** Random id for correlating a call with the backend log. */
export function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}
