import { APP_ENVIRONMENT, type AppEnvironment } from '@core/config/app-config.enums';
import { THEME, type Theme } from '@core/theme/theme.enums';
import { type IconName } from '@supermercado/ui/icon';

/** Theme button for each current theme: it offers switching to the other one. */
export const THEME_TOGGLE: Record<Theme, { readonly label: string; readonly icon: IconName }> = {
  [THEME.light]: { label: 'Usar tema escuro', icon: 'moon' },
  [THEME.dark]: { label: 'Usar tema claro', icon: 'sun' },
};

/** Environment badge text; `null` in production (no badge). */
export const ENVIRONMENT_LABEL: Record<AppEnvironment, string | null> = {
  [APP_ENVIRONMENT.development]: 'Desenvolvimento',
  [APP_ENVIRONMENT.homologation]: 'Homologação',
  [APP_ENVIRONMENT.production]: null,
};
