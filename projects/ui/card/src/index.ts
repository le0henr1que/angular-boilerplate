import {
  UiCard,
  UiCardAction,
  UiCardContent,
  UiCardDescription,
  UiCardFooter,
  UiCardHeader,
  UiCardTitle,
} from './lib/ui-card';

export * from './lib/ui-card';

export const UiCardImports = [
  UiCard,
  UiCardHeader,
  UiCardTitle,
  UiCardDescription,
  UiCardAction,
  UiCardContent,
  UiCardFooter,
] as const;
