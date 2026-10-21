import { createEnvironmentInjector, EnvironmentInjector, inject, Injectable } from '@angular/core';
import type * as Msal from './msal.chunk';

type ChunkMsal = typeof Msal;

export interface MsalCarregado {
  /** Injector filho do root, com o MSAL (token `MSAL` → PublicClientApplication). */
  readonly injector: EnvironmentInjector;
  readonly chunk: ChunkMsal;
}

/**
 * Baixa o MSAL só quando o modo `msal` é usado de fato.
 *
 * O MSAL é ~40% do que seria o bundle inicial. Estático, iria para todo ambiente, inclusive
 * os que usam mock/bff ou têm a autenticação desligada. Aqui ele vira um chunk à parte,
 * baixado uma vez (na consulta da sessão, antes da 1ª rota) e reaproveitado pelo gateway e
 * pelo interceptor do token.
 *
 * Os providers do MSAL vão num injector filho criado na hora: o injector raiz já está
 * pronto quando o chunk chega, e não dá para registrar providers nele depois.
 */
@Injectable({ providedIn: 'root' })
export class CarregadorMsal {
  readonly #pai = inject(EnvironmentInjector);
  #carregado: Promise<MsalCarregado> | undefined;

  carregar(): Promise<MsalCarregado> {
    this.#carregado ??= import('./msal.chunk').then(
      (chunk) => ({
        chunk,
        // MsalAuthGateway é providedIn: 'root'; listado aqui, nasce no filho e enxerga o MSAL.
        injector: createEnvironmentInjector(
          [chunk.provideMsal(), chunk.MsalAuthGateway],
          this.#pai,
          'msal',
        ),
      }),
      (erro: unknown) => {
        // Falhou ao baixar (rede, deploy novo): permite tentar de novo na próxima chamada.
        this.#carregado = undefined;
        throw erro;
      },
    );
    return this.#carregado;
  }
}
