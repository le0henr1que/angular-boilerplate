import { ROLE } from '../auth.enums';
import { type MockPersona } from '../auth.types';

/** Test users for the simulated login (auth.mode = 'mock'). One per role. */
export const MOCK_PERSONAS: readonly MockPersona[] = [
  {
    id: ROLE.admin,
    description: 'Administrador: acessa tudo, inclusive /admin',
    user: { id: 'u-1', name: 'Ana Admin', email: 'ana.admin@exemplo.com', roles: [ROLE.admin] },
  },
  {
    id: ROLE.operator,
    description: 'Operador: produtos e fornecedores, sem /admin',
    user: {
      id: 'u-2',
      name: 'Carlos Operador',
      email: 'carlos.operador@exemplo.com',
      roles: [ROLE.operator],
    },
  },
  {
    id: ROLE.customer,
    description: 'Cliente: consulta produtos e preços, sem /admin',
    user: {
      id: 'u-3',
      name: 'Clara Cliente',
      email: 'clara.cliente@exemplo.com',
      roles: [ROLE.customer],
    },
  },
];
