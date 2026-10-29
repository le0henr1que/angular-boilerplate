/**
 * Why the session screen opened (route `data.reason`). Its own file so app.routes.ts can import
 * it without pulling the (lazy) session page into the initial bundle.
 */
export const SESSION_REASON = {
  signedOut: 'signed-out',
  error: 'error',
} as const;
export type SessionReason = (typeof SESSION_REASON)[keyof typeof SESSION_REASON];
