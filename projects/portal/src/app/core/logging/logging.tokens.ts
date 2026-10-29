import { HttpContextToken } from '@angular/common/http';
import { InjectionToken } from '@angular/core';
import { type LogTarget } from './logging.types';

/** Where the records go. Each target is registered with `multi: true` (see provide-logging.ts). */
export const LOG_TARGETS = new InjectionToken<readonly LogTarget[]>('LOG_TARGETS');

/**
 * Statuses that, for THIS call, are a normal response and not a problem (logged as debug).
 * E.g. the 401 of "who is signed in?" when nobody is:
 * `http.get(url, { context: new HttpContext().set(EXPECTED_STATUSES, [401]) })`.
 */
export const EXPECTED_STATUSES = new HttpContextToken<readonly number[]>(() => []);
