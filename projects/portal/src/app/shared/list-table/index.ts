// API pública da list-table. Fora desta pasta, importe sempre de '@shared/list-table'.
import { ListTableFiltroBooleano } from './components/filtros/list-table-filtro-booleano/list-table-filtro-booleano';
import { ListTableFiltroOpcoes } from './components/filtros/list-table-filtro-opcoes/list-table-filtro-opcoes';
import { ListTable } from './list-table';

export { ListTableFiltroBooleano } from './components/filtros/list-table-filtro-booleano/list-table-filtro-booleano';
export { ListTableFiltroOpcoes } from './components/filtros/list-table-filtro-opcoes/list-table-filtro-opcoes';
export { injectListTableFilter } from './hooks/inject-list-table-filter';
export { ListTable } from './list-table';
export {
  LIST_TABLE_CONFIG,
  LIST_TABLE_CONFIG_PADRAO,
  type ListTableConfig,
  type ListTableConfigParcial,
  type ListTableParams,
  type ListTableTextos,
  provideListTable,
} from './list-table.config';
export {
  LIST_TABLE_CONTEXTO,
  type ListTableContexto,
  type OpcoesDeAplicacao,
} from './list-table.context';
export {
  type CampoUrl,
  type CamposUrl,
  SEM_VALOR,
  type ValoresDosCampos,
} from './models/campo-url';
export {
  definirFiltro,
  filtroBooleano,
  filtroNumero,
  filtroOpcoes,
  filtroTexto,
  PARAM_LIGADO,
  TODAS_AS_OPCOES,
  type TodasAsOpcoes,
} from './models/filtros';
export {
  DIRECAO_ORDENACAO,
  type DirecaoOrdenacao,
  type ListTableColuna,
  type ListTableFonte,
  type ListTableRequisicao,
  type ListTableResultado,
  type Ordenacao,
  type Paginacao,
  PRIMEIRA_PAGINA,
} from './models/list-table.models';

/** O container e os filtros prontos: imports: [ListTableImports, UiDataTableImports]. */
export const ListTableImports = [
  ListTable,
  ListTableFiltroOpcoes,
  ListTableFiltroBooleano,
] as const;
