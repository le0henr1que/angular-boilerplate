import { type Usuario } from '../usuario';

export interface PersonaMock {
  readonly id: string;
  readonly descricao: string;
  readonly usuario: Usuario;
}

/** Usuários de teste do login simulado (auth.modo = 'mock'). Um por papel. */
export const PERSONAS_MOCK: readonly PersonaMock[] = [
  {
    id: 'admin',
    descricao: 'Administrador: acessa tudo, inclusive /admin',
    usuario: { id: 'u-1', nome: 'Ana Admin', email: 'ana.admin@exemplo.com', papeis: ['admin'] },
  },
  {
    id: 'operador',
    descricao: 'Operador: produtos e fornecedores, sem /admin',
    usuario: {
      id: 'u-2',
      nome: 'Carlos Operador',
      email: 'carlos.operador@exemplo.com',
      papeis: ['operador'],
    },
  },
  {
    id: 'cliente',
    descricao: 'Cliente: consulta produtos e preços, sem /admin',
    usuario: {
      id: 'u-3',
      nome: 'Clara Cliente',
      email: 'clara.cliente@exemplo.com',
      papeis: ['cliente'],
    },
  },
];
