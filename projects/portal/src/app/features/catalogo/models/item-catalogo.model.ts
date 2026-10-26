/** Formato que a API devolve em GET {apiUrl}/catalogo. Objetos aninhados, como numa API real. */
export interface ItemCatalogo {
  id: number;
  nome: string;
  preco: number;
  categoria: { id: number; nome: string };
  fornecedor: { nome: string; cidade: string };
  estoque: { quantidade: number; minimo: number };
}
