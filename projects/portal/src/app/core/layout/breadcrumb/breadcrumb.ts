import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { UiBreadcrumbImports } from '@supermercado/ui/breadcrumb';
import { filter, map } from 'rxjs';
import { buildTrail } from './breadcrumb.utils';

/** Breadcrumb trail built from the current URL. */
@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink, UiBreadcrumbImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length) {
      <nav aria-label="Trilha de navegação" class="trail">
        <ol ui-breadcrumb>
          @for (item of items(); track item.route; let last = $last) {
            <li ui-breadcrumb-item>
              @if (last) {
                <span ui-breadcrumb-page>{{ item.label }}</span>
              } @else {
                <a ui-breadcrumb-link [routerLink]="item.route">{{ item.label }}</a>
              }
            </li>
          }
        </ol>
      </nav>
    }
  `,
  styles: `
    .trail {
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
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.#router.url },
  );

  protected readonly items = computed(() => buildTrail(this.#url()));
}
