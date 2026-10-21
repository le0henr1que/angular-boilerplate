import { type Produto } from '@features/produtos';

/** Dados fixos e pequenos para os testes (independentes da API simulada). */
export const PRODUTOS_TESTE: Produto[] = [
  {
    codigo: 'HO-1',
    nome: 'Banana prata (kg)',
    categoria: 'Hortifruti',
    fabricacao: '2026-01-01',
    validade: '2026-01-08',
    preco: 7.99,
    status: 'disponivel',
    fornecedor: 'Hortifruti Vale Verde',
    loja: 'Loja Centro',
  },
  {
    codigo: 'BE-2',
    nome: 'Suco de laranja 1 L',
    categoria: 'Bebidas',
    fabricacao: '2026-02-10',
    validade: '2026-08-09',
    preco: 9.8,
    status: 'baixo',
    fornecedor: 'Distribuidora Bom Preço',
    loja: 'Loja Norte',
  },
  {
    codigo: 'PA-3',
    nome: 'Pão de forma integral',
    categoria: 'Padaria',
    fabricacao: '2026-03-15',
    validade: '2026-03-20',
    preco: 12.5,
    status: 'esgotado',
    fornecedor: 'Distribuidora Bom Preço',
    loja: 'Loja Sul',
  },
];
