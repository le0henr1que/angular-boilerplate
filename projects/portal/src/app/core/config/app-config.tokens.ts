import { InjectionToken } from '@angular/core';
import { type AppConfig } from './app-config.types';

/**
 * Environment configuration available through DI.
 * Only `app.config.ts` imports `environments/`; the rest of the app asks for `inject(APP_CONFIG)`,
 * which lets tests swap the configuration without touching files.
 */
export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
