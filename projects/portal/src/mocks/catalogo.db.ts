import { type CategoriaCatalogo, CATEGORIAS_CATALOGO, type ItemCatalogo } from '@features/catalogo';

// "Banco de dados" em memória do GET /catalogo da API simulada.
// Mesmo formato que a API real deve devolver (objetos aninhados). Gerado de forma
// determinística (sem Math.random) para os dados serem sempre os mesmos a cada recarga.

const PRODUTOS: Record<CategoriaCatalogo, string[]> = {
  Hortifruti: [
    'Banana prata (kg)',
    'Tomate italiano (kg)',
    'Alface crespa',
    'Maçã gala (kg)',
    'Cebola (kg)',
    'Batata inglesa (kg)',
    'Cenoura (kg)',
    'Limão tahiti (kg)',
    'Mamão formosa (kg)',
    'Pimentão verde (kg)',
    'Abacaxi pérola',
    'Uva Itália (kg)',
    'Manga Tommy (kg)',
    'Couve manteiga',
    'Abobrinha (kg)',
    'Laranja pera (kg)',
  ],
  Padaria: [
    'Pão francês (kg)',
    'Pão de forma integral',
    'Bolo de cenoura',
    'Croissant de queijo',
    'Biscoito de polvilho',
    'Pão de queijo (kg)',
    'Sonho de creme',
    'Baguete',
    'Torrada integral',
    'Rosca doce',
    'Pão sírio',
    'Broa de milho',
    'Bolo de fubá',
    'Pão de hambúrguer',
  ],
  Bebidas: [
    'Água mineral 1,5 L',
    'Suco de laranja 1 L',
    'Refrigerante de guaraná 2 L',
    'Café torrado 500 g',
    'Chá-mate 1 L',
    'Água de coco 1 L',
    'Achocolatado 1 L',
    'Leite integral 1 L',
    'Energético 473 ml',
    'Suco de uva 1 L',
    'Cerveja lata 350 ml',
    'Água com gás 500 ml',
    'Iogurte de morango 1 L',
    'Café solúvel 200 g',
    'Chá verde 25 sachês',
    'Kombucha 300 ml',
    'Refrigerante de cola 2 L',
  ],
  Limpeza: [
    'Detergente neutro 500 ml',
    'Sabão em pó 1 kg',
    'Água sanitária 2 L',
    'Desinfetante 2 L',
    'Esponja dupla face',
    'Amaciante 2 L',
    'Limpa vidros 500 ml',
    'Saco de lixo 50 L',
    'Papel toalha',
    'Multiuso 500 ml',
    'Lustra-móveis 200 ml',
    'Pano de chão',
    'Sabão em barra',
  ],
};

const FORNECEDORES: Record<CategoriaCatalogo, ItemCatalogo['fornecedor'][]> = {
  Hortifruti: [
    { nome: 'Sítio Bom Fruto', cidade: 'Petrolina' },
    { nome: 'Horta Verde Vale', cidade: 'Vitória de Santo Antão' },
  ],
  Padaria: [
    { nome: 'Panificadora Trigo Fino', cidade: 'Recife' },
    { nome: 'Forno de Minas', cidade: 'Contagem' },
  ],
  Bebidas: [
    { nome: 'Citrus Vale', cidade: 'Limeira' },
    { nome: 'Torrefação Serra Alta', cidade: 'Garanhuns' },
    { nome: 'Laticínios Boa Vista', cidade: 'Garanhuns' },
  ],
  Limpeza: [
    { nome: 'Limpa Mais', cidade: 'São Paulo' },
    { nome: 'Química Brilho', cidade: 'Jaboatão' },
  ],
};

/** Uns 1/3 dos itens ficam no mínimo ou abaixo, para o filtro "estoque baixo" ter resultado. */
const ITENS_COM_ESTOQUE_BAIXO_A_CADA = 3;

function quantidadeEmEstoque(indice: number, semente: number, minimo: number): number {
  if (indice % ITENS_COM_ESTOQUE_BAIXO_A_CADA === 0) return minimo - (semente % minimo);
  return minimo + ((semente * 13) % 150);
}

export const CATALOGO_DB: ItemCatalogo[] = CATEGORIAS_CATALOGO.flatMap((categoria, c) =>
  PRODUTOS[categoria].map((nome, i) => {
    const semente = c * 31 + i * 7;
    const fornecedores = FORNECEDORES[categoria];
    const minimo = 10 + (semente % 4) * 10;
    return {
      id: 0, // preenchido abaixo, em sequência
      nome,
      preco: Math.round((2 + ((semente * 37) % 2800) / 100) * 100) / 100,
      categoria: { id: c + 1, nome: categoria },
      fornecedor: fornecedores[i % fornecedores.length],
      estoque: { quantidade: quantidadeEmEstoque(i, semente, minimo), minimo },
    };
  }),
).map((item, indice) => ({ ...item, id: indice + 1 }));
