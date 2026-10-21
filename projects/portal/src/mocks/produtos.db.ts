import { type Categoria, type Produto, STATUS_PRODUTO } from '@features/produtos';

// "Banco de dados" em memória da API simulada. Gerado de forma determinística
// (sem Math.random) para os dados serem sempre os mesmos a cada recarga.
const ITENS: [string, Categoria][] = [
  ['Banana prata (kg)', 'Hortifruti'],
  ['Tomate italiano (kg)', 'Hortifruti'],
  ['Alface crespa', 'Hortifruti'],
  ['Maçã gala (kg)', 'Hortifruti'],
  ['Cebola (kg)', 'Hortifruti'],
  ['Pão francês (kg)', 'Padaria'],
  ['Pão de forma integral', 'Padaria'],
  ['Bolo de cenoura', 'Padaria'],
  ['Croissant de queijo', 'Padaria'],
  ['Biscoito de polvilho', 'Padaria'],
  ['Água mineral 1,5 L', 'Bebidas'],
  ['Suco de laranja 1 L', 'Bebidas'],
  ['Refrigerante de guaraná 2 L', 'Bebidas'],
  ['Café torrado 500 g', 'Bebidas'],
  ['Chá-mate 1 L', 'Bebidas'],
  ['Leite integral 1 L', 'Bebidas'],
  ['Detergente neutro 500 ml', 'Limpeza'],
  ['Sabão em pó 1 kg', 'Limpeza'],
  ['Água sanitária 2 L', 'Limpeza'],
  ['Esponja multiuso', 'Limpeza'],
  ['Amaciante 2 L', 'Limpeza'],
  ['Papel toalha (2 rolos)', 'Limpeza'],
];
const PREFIXO: Record<Categoria, string> = {
  Hortifruti: 'HO',
  Padaria: 'PA',
  Bebidas: 'BE',
  Limpeza: 'LI',
};
/** Quantos dias cada categoria dura na prateleira. */
const VALIDADE_DIAS: Record<Categoria, number> = {
  Hortifruti: 7,
  Padaria: 5,
  Bebidas: 180,
  Limpeza: 720,
};
const FORNECEDORES = ['Hortifruti Vale Verde', 'Distribuidora Bom Preço', 'Atacado Central'];
const LOJAS = ['Loja Centro', 'Loja Norte', 'Loja Sul', 'Loja Shopping', 'Loja Rodoviária'];

const iso = (data: Date) => data.toISOString().slice(0, 10);
const somarDias = (data: Date, dias: number) => new Date(data.getTime() + dias * 86_400_000);

export const PRODUTOS_DB: Produto[] = ITENS.map(([nome, categoria], i) => {
  const fabricacao = new Date(Date.UTC(2026, i % 12, (i % 27) + 1));
  return {
    codigo: `${PREFIXO[categoria]}-${String(1001 + i * 37)}`,
    nome,
    categoria,
    fabricacao: iso(fabricacao),
    validade: iso(somarDias(fabricacao, VALIDADE_DIAS[categoria])),
    preco: Math.round((2.49 + ((i * 731) % 2800) / 100) * 100) / 100,
    status: STATUS_PRODUTO[i % 5 === 3 ? 2 : i % 4 === 1 ? 1 : 0],
    fornecedor: FORNECEDORES[i % FORNECEDORES.length],
    loja: LOJAS[i % LOJAS.length],
  };
});
