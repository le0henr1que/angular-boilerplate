import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { UiBreadcrumbImports } from '@supermercado/ui/breadcrumb';
import { filter, map } from 'rxjs';

/** Rotas em que a trilha não aparece (primeiro segmento da URL). */
const ROTAS_SEM_TRILHA = ['login'];

export interface ItemTrilha {
  rotulo: string;
  rota: string;
}

/** "sem-permissao" → "Sem Permissao" */
export function formatarSegmento(segmento: string): string {
  return decodeURIComponent(segmento)
    .split('-')
    .filter(Boolean)
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
}

/** "/produtos/novo-item?x=1" → [Produtos (/produtos), Novo Item (/produtos/novo-item)] */
export function montarTrilha(url: string): ItemTrilha[] {
  const segmentos = url.split(/[?#]/)[0].split('/').filter(Boolean);
  if (ROTAS_SEM_TRILHA.includes(segmentos[0])) return [];
  return segmentos.map((segmento, i) => ({
    rotulo: formatarSegmento(segmento),
    rota: '/' + segmentos.slice(0, i + 1).join('/'),
  }));
}

/** Trilha de navegação montada a partir da URL atual. */
@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink, UiBreadcrumbImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (itens().length) {
      <nav aria-label="Trilha de navegação" class="trilha">
        <ol ui-breadcrumb>
          @for (item of itens(); track item.rota; let ultimo = $last) {
            <li ui-breadcrumb-item>
              @if (ultimo) {
                <span ui-breadcrumb-page>{{ item.rotulo }}</span>
              } @else {
                <a ui-breadcrumb-link [routerLink]="item.rota">{{ item.rotulo }}</a>
              }
            </li>
          }
        </ol>
      </nav>
    }
  `,
  styles: `
    .trilha {
      max-width: 72rem;
      margin: 0 auto;
      padding: 1rem 1rem 0;
    }
  `,
})
export class AppBreadcrumb {
  readonly #router = inject(Router);

  readonly #url = toSignal(
    this.#router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      map((evento) => evento.urlAfterRedirects),
    ),
    { initialValue: this.#router.url },
  );

  protected readonly itens = computed(() => montarTrilha(this.#url()));
}
