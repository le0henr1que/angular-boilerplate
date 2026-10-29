import { type Provider } from '@angular/core';
import { APP_CONFIG } from './app-config.tokens';
import { type AppConfig } from './app-config.types';

/** Registers the environment configuration (only app.config.ts and the tests call it). */
export function provideAppConfig(config: AppConfig): Provider {
  return { provide: APP_CONFIG, useValue: config };
}
