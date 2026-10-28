import { computed } from '@angular/core';
import { type Params } from '@angular/router';
import {
  type CampoUrl,
  type CamposUrl,
  lerCampo,
  textoDoCampo,
  valoresIguais,
} from '../models/campo-url';
import { type ParametrosUrl } from './inject-parametros-url';

/**
 * "Hook" genérico dos filtros específicos de uma listagem. Recebe a descrição dos campos
 * (pode mudar: é um signal, como um input) e devolve os valores lidos da URL e os
 * parâmetros para gravar. Não navega: quem compõe decide quando (e junto com o quê).
 */
export function injectFiltros<F extends object>(campos: () => CamposUrl<F>, url: ParametrosUrl) {
  const chaves = computed(() => Object.keys(campos()) as (keyof F & string)[]);
  const campo = <K extends keyof F>(chave: K): CampoUrl<F[K]> => campos()[chave];

  /** Valores aplicados. Só emite quando algum valor muda de fato (a query não roda à toa). */
  const valores = computed<F>(
    () =>
      Object.fromEntries(
        chaves().map((chave) => [chave, lerCampo(campo(chave), url.ler)]),
      ) as unknown as F,
    { equal: (a, b) => chaves().every((chave) => valoresIguais(campo(chave), a[chave], b[chave])) },
  );

  return {
    valores,
    /** Algum filtro diferente do padrão. */
    ativo: computed(() =>
      chaves().some((chave) => !valoresIguais(campo(chave), valores()[chave], campo(chave).padrao)),
    ),
    /** Parâmetros só das chaves informadas. */
    paraParams(mudancas: Partial<F>): Params {
      return Object.fromEntries(
        (Object.keys(mudancas) as (keyof F & string)[]).map((chave) => [
          campo(chave).param,
          textoDoCampo(campo(chave), mudancas[chave] as F[typeof chave]),
        ]),
      );
    },
    /** Tira todos os filtros da URL. */
    paramsDeLimpeza(): Params {
      return Object.fromEntries(chaves().map((chave) => [campo(chave).param, null]));
    },
  };
}
