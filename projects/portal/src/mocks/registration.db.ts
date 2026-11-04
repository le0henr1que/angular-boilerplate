import { type Category, type RegistrationStatus, type Supplier } from '@features/suppliers';

// In-memory "database" for the mock API's GET /fornecedores and GET /categorias.
// Generated deterministically (no Math.random) so the data is always the same on every reload.

const CATEGORY_NAMES = [
  'Hortifruti',
  'Padaria',
  'Bebidas',
  'Limpeza',
  'Laticínios',
  'Carnes',
  'Mercearia',
  'Higiene',
  'Congelados',
  'Pet',
  'Utilidades',
  'Bazar',
];

/** Suppliers in category order: the i-th supplier serves CATEGORY_NAMES[i % 12]. */
const SUPPLIER_NAMES = [
  'Hortifruti Vale Verde',
  'Panificadora Trigo Fino',
  'Distribuidora Bom Preço',
  'Química Brilho',
  'Laticínios Boa Vista',
  'Frigorífico Serra Azul',
  'Cerealista Campo Bom',
  'Cosméticos Flor de Lis',
  'Gelados Polar',
  'Pet Nutri',
  'Casa & Cia Utilidades',
  'Bazar Estrela',
  'Sítio Bom Fruto',
  'Forno de Minas Pães',
  'Águas Serra Clara',
  'Limpa Tudo Indústria',
  'Queijaria Agreste',
  'Granja Sol Nascente',
  'Torrefação Serra Alta',
  'Higiene Total',
  'Congelados do Vale',
  'Ração Amiga',
  'Plásticos Recife',
  'Papelaria Central',
  'Horta Verde Vale',
  'Confeitaria Doce Lar',
  'Citrus Vale',
  'Brilho Max',
  'Leite Puro Sertão',
  'Pescados Maré Alta',
  'Grãos do Sertão',
  'Perfumaria Aroma',
  'Pizza Pronta Congelados',
  'Mundo Pet Distribuidora',
  'Utilar Nordeste',
  'Variedades Capibaribe',
];

const LOCATIONS: Supplier['location'][] = [
  { city: 'Recife', state: 'PE' },
  { city: 'Olinda', state: 'PE' },
  { city: 'Caruaru', state: 'PE' },
  { city: 'Petrolina', state: 'PE' },
  { city: 'João Pessoa', state: 'PB' },
  { city: 'Maceió', state: 'AL' },
  { city: 'Natal', state: 'RN' },
  { city: 'Salvador', state: 'BA' },
];

const EDITORS = ['João Silva', 'Maria Santos', 'Ana Lima', 'Carlos Souza'];

/** Most records active; every 5th inactive and every 5th (offset 3) pending. */
function statusOf(seed: number): RegistrationStatus {
  if (seed % 5 === 0) return 'inactive';
  if (seed % 5 === 3) return 'pending';
  return 'active';
}

/** Some hours before 01/11/2026 08:00 UTC, always on a round minute. */
function updatedAtOf(seed: number): string {
  const base = Date.UTC(2026, 10, 1, 8, 0);
  const hours = (seed * 37) % 900;
  const minutes = (seed * 13) % 60;
  return new Date(base - (hours * 60 + minutes) * 60_000).toISOString().slice(0, 19) + 'Z';
}

const pad = (value: number, size: number) => String(value).padStart(size, '0');

/** Fake but well-formatted CNPJ: 00.000.000/0001-00. */
function documentOf(seed: number): string {
  return `${pad((seed * 7) % 100, 2)}.${pad((seed * 131) % 1000, 3)}.${pad((seed * 557) % 1000, 3)}/0001-${pad((seed * 29) % 100, 2)}`;
}

export const SUPPLIERS_DB: Supplier[] = SUPPLIER_NAMES.map((name, i) => {
  const c = i % CATEGORY_NAMES.length;
  const seed = i * 7 + 3;
  return {
    id: i + 1,
    name,
    document: documentOf(seed),
    category: { id: c + 1, name: CATEGORY_NAMES[c] },
    location: LOCATIONS[seed % LOCATIONS.length],
    status: statusOf(i + 1),
    updatedAt: updatedAtOf(seed),
    updatedBy: EDITORS[seed % EDITORS.length],
  };
});

export const CATEGORIES_DB: Category[] = CATEGORY_NAMES.map((name, c) => {
  const seed = c * 11 + 5;
  return {
    id: c + 1,
    name,
    productCount: 8 + ((seed * 17) % 140),
    supplierCount: SUPPLIERS_DB.filter((supplier) => supplier.category.id === c + 1).length,
    status: statusOf(c + 2),
    updatedAt: updatedAtOf(seed),
    updatedBy: EDITORS[seed % EDITORS.length],
  };
});
