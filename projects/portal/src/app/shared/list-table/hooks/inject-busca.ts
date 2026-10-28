import { computed, DestroyRef, inject, linkedSignal } from '@angular/core';
import { type Params } from '@angular/router';
import { type OpcoesDeAplicacao } from '../list-table.context';
import { lerCampo, SEM_VALOR, textoDoCampo } from '../models/campo-url';
import { filtroTexto } from '../models/filtros';
import { type ParametrosUrl } from './inject-parametros-url';

export interface ConfigBusca {
  param: string;
  habilitada: () => boolean;
  debounceMs: number;
  /** Chamado quando o texto deve ir para a URL. */
  aplicar: (params: Params, opcoes: OpcoesDeAplicacao) => void;
}

/**
 * "Hook" da busca enquanto digita: espera `debounceMs` sem teclar antes de aplicar (não chama
 * a API a cada letra) e, nesse caso, substitui o histórico (digitar não enche o "voltar").
 *
 * O `texto` do campo segue a URL ("voltar", "Limpar"), mas não apaga o espaço que o usuário
 * está digitando quando a URL volta com o termo sem ele.
 */
export function injectBusca(url: ParametrosUrl, config: ConfigBusca) {
  const campo = filtroTexto(config.param);

  const aplicada = computed(() => {
    if (!config.habilitada()) return SEM_VALOR;
    return lerCampo(campo, url.ler);
  });

  const texto = linkedSignal<string, string>({
    source: aplicada,
    computation: (valorDaUrl, anterior) => {
      if (anterior && anterior.value.trim() === valorDaUrl) return anterior.value;
      return valorDaUrl;
    },
  });

  let espera: ReturnType<typeof setTimeout> | undefined;
  const cancelar = () => clearTimeout(espera);
  inject(DestroyRef).onDestroy(cancelar);

  const paraParams = (valor: string): Params => ({ [campo.param]: textoDoCampo(campo, valor) });

  return {
    /** Termo aplicado (o que vai para a API). */
    aplicada,
    /** Texto do campo; pode estar à frente da URL enquanto o debounce corre. */
    texto: texto.asReadonly(),
    ativa: computed(() => aplicada() !== campo.padrao),
    digitar(valor: string) {
      texto.set(valor);
      cancelar();
      espera = setTimeout(
        () => config.aplicar(paraParams(valor), { substituirHistorico: true }),
        config.debounceMs,
      );
    },
    /** Enter: aplica na hora, sem esperar o debounce. */
    aplicarAgora() {
      cancelar();
      config.aplicar(paraParams(texto()), {});
    },
    cancelar,
    paramsDeLimpeza: (): Params => ({ [campo.param]: null }),
  };
}
