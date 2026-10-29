import { type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config.tokens';

/** Absolute URL (https://…, //cdn…) or app-relative path (/assets/…): left as is. */
const NOT_AN_API_PATH = /^([a-z][a-z\d+.-]*:|\/)/i;

/**
 * Single place for the API base URL: services ask only for the resource path and this interceptor
 * prefixes the environment's `apiUrl` (environments/*.ts):
 *
 *   http.get('produtos')            → GET /api/produtos
 *   http.get('https://viacep…')     → unchanged (external API)
 *   http.get('/assets/x.json')      → unchanged (app file)
 *
 * Register it FIRST: the other interceptors (log, auth, MSAL token, mock API) see the final URL.
 * Changing `apiUrl` changes every service and the mock API together.
 */
export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (NOT_AN_API_PATH.test(req.url)) return next(req);
  const { apiUrl } = inject(APP_CONFIG);
  return next(req.clone({ url: `${apiUrl}/${req.url}` }));
};
