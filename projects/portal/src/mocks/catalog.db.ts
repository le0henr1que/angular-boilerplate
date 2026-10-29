import { CATALOG_CATEGORIES, type CatalogCategory, type CatalogItem } from '@features/catalog';

// In-memory "database" for the mock API's GET /catalogo.
// The same shape the real API should return (nested objects). Generated deterministically
// (no Math.random) so the data is always the same on every reload.

const PRODUCTS: Record<CatalogCategory, string[]> = {
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

const SUPPLIERS: Record<CatalogCategory, CatalogItem['supplier'][]> = {
  Hortifruti: [
    { name: 'Sítio Bom Fruto', city: 'Petrolina' },
    { name: 'Horta Verde Vale', city: 'Vitória de Santo Antão' },
  ],
  Padaria: [
    { name: 'Panificadora Trigo Fino', city: 'Recife' },
    { name: 'Forno de Minas', city: 'Contagem' },
  ],
  Bebidas: [
    { name: 'Citrus Vale', city: 'Limeira' },
    { name: 'Torrefação Serra Alta', city: 'Garanhuns' },
    { name: 'Laticínios Boa Vista', city: 'Garanhuns' },
  ],
  Limpeza: [
    { name: 'Limpa Mais', city: 'São Paulo' },
    { name: 'Química Brilho', city: 'Jaboatão' },
  ],
};

/** About 1/3 of the items sit at the minimum or below, so the "low stock" filter has results. */
const LOW_STOCK_EVERY = 3;

function stockQuantity(index: number, seed: number, minimum: number): number {
  if (index % LOW_STOCK_EVERY === 0) return minimum - (seed % minimum);
  return minimum + ((seed * 13) % 150);
}

export const CATALOG_DB: CatalogItem[] = CATALOG_CATEGORIES.flatMap((category, c) =>
  PRODUCTS[category].map((name, i) => {
    const seed = c * 31 + i * 7;
    const suppliers = SUPPLIERS[category];
    const minimum = 10 + (seed % 4) * 10;
    return {
      id: 0, // filled in below, in sequence
      name,
      price: Math.round((2 + ((seed * 37) % 2800) / 100) * 100) / 100,
      category: { id: c + 1, name: category },
      supplier: suppliers[i % suppliers.length],
      stock: { quantity: stockQuantity(i, seed, minimum), minimum },
    };
  }),
).map((item, index) => ({ ...item, id: index + 1 }));
