/**
 * Papéis do sistema. Com Azure AD, são os "App roles" do registro do app:
 * o backend lê a claim `roles` do token e devolve aqui já traduzido.
 */
export type Papel = 'admin' | 'operador' | 'cliente';

/** Formato que o backend devolve em GET auth.urls.usuario (o "/me"). */
export interface Usuario {
  readonly id: string;
  readonly nome: string;
  readonly email: string;
  readonly papeis: readonly Papel[];
}
