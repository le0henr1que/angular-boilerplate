import { SESSION_REASON, type SessionReason } from './session.enums';
import { type SessionText } from './session.types';

export const SESSION_TEXTS: Record<SessionReason, SessionText> = {
  [SESSION_REASON.signedOut]: {
    title: 'Você saiu',
    description: 'Sua sessão foi encerrada.',
    action: 'Entrar de novo',
  },
  [SESSION_REASON.error]: {
    title: 'Não foi possível entrar',
    description: 'O login não foi concluído. Tente de novo; se continuar, fale com o suporte.',
    action: 'Tentar de novo',
  },
};
