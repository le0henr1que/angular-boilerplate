import { computed } from '@angular/core';
import { type Params } from '@angular/router';
import {
  DIRECAO_ORDENACAO,
  type DirecaoOrdenacao,
  type Ordenacao,
} from '../models/list-table.models';
import { type ParametrosUrl } from './inject-parametros-url';

export interface ConfigOrdenacao {
  paramCampo: string;
  paramDirecao: string;
  habilitada: () => boolean;
  /** Ids das colunas ordenáveis: um campo fora delas, vindo da URL, é ignorado. */
  campos: () => readonly string[];
  /** Ordenação quando a URL não tem nenhuma. */
  padrao: () => Ordenacao | null;
}

const DIRECOES: readonly DirecaoOrdenacao[] = Object.values(DIRECAO_ORDENACAO);

/** Clique no mesmo cabeçalho: crescente → decrescente → sem ordenação (volta ao padrão). */
const PROXIMA_DIRECAO: Record<DirecaoOrdenacao, DirecaoOrdenacao | null> = {
  [DIRECAO_ORDENACAO.crescente]: DIRECAO_ORDENACAO.decrescente,
  [DIRECAO_ORDENACAO.decrescente]: null,
};

function paraDirecao(texto: string | null): DirecaoOrdenacao {
  return DIRECOES.find((direcao) => direcao === texto) ?? DIRECAO_ORDENACAO.crescente;
}

/** "Hook" de ordenação na URL (?ordenarPor=preco&direcao=desc). Desligada, o estado é null. */
export function injectOrdenacao(url: ParametrosUrl, config: ConfigOrdenacao) {
  const estado = computed<Ordenacao | null>(
    () => {
      if (!config.habilitada()) return null;
      const campo = url.ler(config.paramCampo);
      if (campo === null || !config.campos().includes(campo)) return config.padrao();
      return { campo, direcao: paraDirecao(url.ler(config.paramDirecao)) };
    },
    { equal: (a, b) => a?.campo === b?.campo && a?.direcao === b?.direcao },
  );

  function paraParams(ordenacao: Ordenacao | null): Params {
    if (!ordenacao) return { [config.paramCampo]: null, [config.paramDirecao]: null };
    return { [config.paramCampo]: ordenacao.campo, [config.paramDirecao]: ordenacao.direcao };
  }

  /** O próximo passo do ciclo ao clicar no cabeçalho de `campo`. */
  function proxima(campo: string): Ordenacao | null {
    const atual = estado();
    if (atual?.campo !== campo) return { campo, direcao: DIRECAO_ORDENACAO.crescente };
    const direcao = PROXIMA_DIRECAO[atual.direcao];
    if (!direcao) return null;
    return { campo, direcao };
  }

  return {
    estado,
    paramsDoClique: (campo: string): Params => paraParams(proxima(campo)),
  };
}
