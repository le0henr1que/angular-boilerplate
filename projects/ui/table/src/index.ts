import { UiTable, UiTableContainer, UiTBody, UiTd, UiTh, UiTHead, UiTr } from './lib/ui-table';

export * from './lib/ui-table';

export const UiTableImports = [
  UiTableContainer,
  UiTable,
  UiTHead,
  UiTBody,
  UiTr,
  UiTh,
  UiTd,
] as const;
