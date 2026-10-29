import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID, type Provider } from '@angular/core';

registerLocaleData(localePt);

/** Same locale as the app (app.config.ts): "R$ 1.500,00" currency and Brazilian dates. */
export function provideLocalePtBr(): Provider {
  return { provide: LOCALE_ID, useValue: 'pt-BR' };
}
