// API pública da feature: o que outras partes do app podem usar.
// Quem está fora de features/catalogo importa daqui (@features/catalogo), nunca de arquivos internos.
export {
  CATALOGO_ENDPOINT,
  CATEGORIAS_CATALOGO,
  type CategoriaCatalogo,
  estaComEstoqueBaixo,
  type ItemCatalogo,
  type PaginaCatalogo,
  PARAM_LIGADO,
  PARAMS_CATALOGO,
  POR_PAGINA_PADRAO,
  PRIMEIRA_PAGINA,
} from './models/item-catalogo.model';
