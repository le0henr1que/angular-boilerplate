import { HttpErrorResponse } from '@angular/common/http';
import { QueryClient } from '@tanstack/angular-query-experimental';

/** Quantas vezes tentar de novo uma consulta que falhou por rede/servidor. */
export const MAXIMO_DE_TENTATIVAS = 2;

/**
 * Política de novas tentativas: erro 4xx (ex.: 404, 403) não melhora tentando de novo;
 * erros de rede e 5xx tentam até MAXIMO_DE_TENTATIVAS vezes.
 */
export function deveTentarDeNovo(falhasAteAgora: number, erro: unknown): boolean {
  const erroDoCliente =
    erro instanceof HttpErrorResponse && erro.status >= 400 && erro.status < 500;
  return !erroDoCliente && falhasAteAgora < MAXIMO_DE_TENTATIVAS;
}

/**
 * Configuração global do cache do TanStack Query (o mesmo QueryClient do React).
 * O cache de cada assunto (chaves, hooks) fica no data-access de cada feature;
 * aqui ficam só as regras que valem para o app inteiro.
 */
export function criarQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Por 1 minuto o dado em cache é considerado "fresco": voltar para uma tela já vista
        // mostra o cache na hora e NÃO chama a API. Depois disso, mostra o cache e atualiza por trás.
        staleTime: 60_000,
        retry: deveTentarDeNovo,
      },
    },
  });
}
