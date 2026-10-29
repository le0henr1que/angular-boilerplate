import { UiAlert, UiAlertDescription, UiAlertTitle } from './lib/ui-alert';

export * from './lib/ui-alert';
export * from './lib/ui-alert.types';

export const UiAlertImports = [UiAlert, UiAlertTitle, UiAlertDescription] as const;
