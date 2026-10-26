// API pública da feature: o que outras partes do app podem usar.
// Quem está fora de features/catalogo importa daqui (@features/catalogo), nunca de arquivos internos.
export {
  CATEGORIAS_CATALOGO,
  type CategoriaCatalogo,
  type ItemCatalogo,
  type PaginaCatalogo,
} from './models/item-catalogo.model';
