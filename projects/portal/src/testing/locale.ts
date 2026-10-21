import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID, type Provider } from '@angular/core';

registerLocaleData(localePt);

/** Mesmo locale do app (app.config.ts): moeda "R$ 1.500,00" e datas brasileiras. */
export function provideLocalePtBr(): Provider {
  return { provide: LOCALE_ID, useValue: 'pt-BR' };
}
