import { type EcosystemPartner, PARTNER_TYPES, type PartnerType } from '@features/ecosystem';

// In-memory "database" for the mock API's GET /ecossistema. Generated deterministically
// (no Math.random) so the data is always the same on every reload.

const COMPANIES: Record<PartnerType, string[]> = {
  supplier: [
    'Hortifruti Vale Verde',
    'Distribuidora Bom Preço',
    'Atacado Central',
    'Laticínios Boa Vista',
    'Panificadora Trigo Fino',
    'Citrus Vale',
    'Química Brilho',
    'Frigorífico Serra Azul',
    'Granja Sol Nascente',
    'Torrefação Serra Alta',
    'Cerealista Campo Bom',
    'Pescados Maré Alta',
  ],
  logistics: [
    'TransNordeste Cargas',
    'Rota Fria Logística',
    'Expresso Capibaribe',
    'Entrega Já',
    'Frota Verde Transportes',
    'Last Mile Recife',
    'CD Integrado Suape',
    'Moto Express',
    'Agreste Cargas',
    'LogFrio Refrigerados',
  ],
  payment: [
    'PagFácil',
    'Banco Popular Digital',
    'Cartão Mais',
    'Pix Rápido Gateway',
    'Vale Refeição Nacional',
    'Carteira Digital Zapt',
    'Crédito Amigo',
    'Maquininha Pronta',
  ],
  marketing: [
    'Agência Vitrine',
    'Ofertas Locais',
    'Clube de Vantagens Sim',
    'Studio Encarte',
    'Rádio Cidade FM',
    'Influência Regional',
    'Painéis Urbanos',
    'Cupom Certo',
    'Mídia Ponto de Venda',
  ],
};

const CONTACTS = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Fábio', 'Gabriela', 'Hugo', 'Íris'];

const LOCATIONS: EcosystemPartner['location'][] = [
  { city: 'Recife', state: 'PE' },
  { city: 'Olinda', state: 'PE' },
  { city: 'Caruaru', state: 'PE' },
  { city: 'Petrolina', state: 'PE' },
  { city: 'João Pessoa', state: 'PB' },
  { city: 'Maceió', state: 'AL' },
  { city: 'Natal', state: 'RN' },
  { city: 'Salvador', state: 'BA' },
  { city: 'São Paulo', state: 'SP' },
];

/** About 1 in 5 partners has an ended contract, so the "active only" filter has an effect. */
const INACTIVE_EVERY = 5;

const iso = (date: Date) => date.toISOString().slice(0, 10);

/** "Distribuidora Bom Preço" → "distribuidorabompreco" (for the e-mail domain). */
const slug = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z]/gi, '')
    .toLowerCase();

export const ECOSYSTEM_DB: EcosystemPartner[] = PARTNER_TYPES.flatMap((type, t) =>
  COMPANIES[type].map((name, i) => {
    const seed = t * 17 + i * 5;
    const contact = CONTACTS[seed % CONTACTS.length];
    return {
      id: 0, // filled in below, in sequence
      name,
      type,
      contact: { name: contact, email: `${slug(contact)}@${slug(name)}.com.br` },
      location: LOCATIONS[seed % LOCATIONS.length],
      partnerSince: iso(new Date(Date.UTC(2015 + (seed % 11), seed % 12, (seed % 27) + 1))),
      active: (i + 1) % INACTIVE_EVERY !== 0,
    };
  }),
).map((partner, index) => ({ ...partner, id: index + 1 }));
