import { type Category, type Product, PRODUCT_STATUSES } from '@features/products';

// In-memory "database" of the mock API. Generated deterministically
// (no Math.random) so the data is always the same on every reload.
const ITEMS: [string, Category][] = [
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
const PREFIX: Record<Category, string> = {
  Hortifruti: 'HO',
  Padaria: 'PA',
  Bebidas: 'BE',
  Limpeza: 'LI',
};
/** How many days each category lasts on the shelf. */
const SHELF_LIFE_DAYS: Record<Category, number> = {
  Hortifruti: 7,
  Padaria: 5,
  Bebidas: 180,
  Limpeza: 720,
};
const SUPPLIERS = ['Hortifruti Vale Verde', 'Distribuidora Bom Preço', 'Atacado Central'];
const STORES = ['Loja Centro', 'Loja Norte', 'Loja Sul', 'Loja Shopping', 'Loja Rodoviária'];

const iso = (date: Date) => date.toISOString().slice(0, 10);
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86_400_000);

/** Index of the status in PRODUCT_STATUSES: every 5th item (offset 3) is out of stock, every 4th (offset 1) is low. */
function statusIndex(i: number): number {
  if (i % 5 === 3) return 2;
  if (i % 4 === 1) return 1;
  return 0;
}

export const PRODUCTS_DB: Product[] = ITEMS.map(([name, category], i) => {
  const manufacturedAt = new Date(Date.UTC(2026, i % 12, (i % 27) + 1));
  return {
    code: `${PREFIX[category]}-${String(1001 + i * 37)}`,
    name,
    category,
    manufacturedAt: iso(manufacturedAt),
    expiresAt: iso(addDays(manufacturedAt, SHELF_LIFE_DAYS[category])),
    price: Math.round((2.49 + ((i * 731) % 2800) / 100) * 100) / 100,
    status: PRODUCT_STATUSES[statusIndex(i)],
    supplier: SUPPLIERS[i % SUPPLIERS.length],
    store: STORES[i % STORES.length],
  };
});
