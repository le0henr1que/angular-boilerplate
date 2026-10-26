import { UiCabecalho, UiCelula, UiDataTable } from './lib/ui-data-table';

export * from './lib/caminho';
export * from './lib/ui-data-table';

export const UiDataTableImports = [UiDataTable, UiCelula, UiCabecalho] as const;
