import { type ItemCatalogo } from '@features/catalogo';

// "Banco de dados" em memória do GET /catalogo da API simulada.
// Mesmo formato que a API real deve devolver (objetos aninhados).
export const CATALOGO_DB: ItemCatalogo[] = [
  {
    id: 1,
    nome: 'Banana prata (kg)',
    preco: 7.99,
    categoria: { id: 1, nome: 'Hortifruti' },
    fornecedor: { nome: 'Sítio Bom Fruto', cidade: 'Petrolina' },
    estoque: { quantidade: 120, minimo: 30 },
  },
  {
    id: 2,
    nome: 'Pão de forma integral',
    preco: 12.5,
    categoria: { id: 2, nome: 'Padaria' },
    fornecedor: { nome: 'Panificadora Trigo Fino', cidade: 'Recife' },
    estoque: { quantidade: 8, minimo: 15 },
  },
  {
    id: 3,
    nome: 'Suco de laranja 1 L',
    preco: 9.8,
    categoria: { id: 3, nome: 'Bebidas' },
    fornecedor: { nome: 'Citrus Vale', cidade: 'Limeira' },
    estoque: { quantidade: 64, minimo: 20 },
  },
  {
    id: 4,
    nome: 'Detergente neutro 500 ml',
    preco: 2.79,
    categoria: { id: 4, nome: 'Limpeza' },
    fornecedor: { nome: 'Limpa Mais', cidade: 'São Paulo' },
    estoque: { quantidade: 0, minimo: 40 },
  },
  {
    id: 5,
    nome: 'Café torrado 500 g',
    preco: 18.9,
    categoria: { id: 3, nome: 'Bebidas' },
    fornecedor: { nome: 'Torrefação Serra Alta', cidade: 'Garanhuns' },
    estoque: { quantidade: 37, minimo: 25 },
  },
  {
    id: 6,
    nome: 'Tomate italiano (kg)',
    preco: 8.49,
    categoria: { id: 1, nome: 'Hortifruti' },
    fornecedor: { nome: 'Sítio Bom Fruto', cidade: 'Petrolina' },
    estoque: { quantidade: 12, minimo: 20 },
  },
];
