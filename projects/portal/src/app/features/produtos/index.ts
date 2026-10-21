// API pública da feature: o que outras partes do app podem usar.
// Quem está fora de features/produtos importa daqui (@features/produtos), nunca de arquivos internos.
export * from './models/produto.model';
export { ProdutosApi } from './data-access/produtos.api';
export { injectProdutos } from './data-access/produtos.queries';
export { StatusProdutoBadge } from './ui/status-produto-badge';
