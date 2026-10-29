import { DEFAULT_DESTINATION } from './auth.constants';

/** Only accepts an internal path: blocks "open redirect" (?voltarPara=https://malicious-site). */
export function internalDestination(url: string | null | undefined): string {
  return url?.startsWith('/') && !url.startsWith('//') ? url : DEFAULT_DESTINATION;
}
