import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppBreadcrumb } from '@core/layout/breadcrumb/breadcrumb';
import { AppFooter } from '@core/layout/footer/footer';
import { injectGlobalLoading } from '@core/layout/global-loading';
import { AppHeader } from '@core/layout/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeader, AppBreadcrumb, AppFooter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!--
      Same HTML as index.html (classes in styles.css): when Angular swaps one for the other,
      nothing flashes. The rest stays underneath, inert (no focus or screen reader), until ready.
    -->
    @if (loading()) {
      <div class="global-loading" role="status">
        <span class="global-loading-spinner" aria-hidden="true"></span>
        <span class="sr-only">Carregando…</span>
      </div>
    }
    <app-header [attr.inert]="loading() ? '' : null" />
    <main [attr.inert]="loading() ? '' : null">
      <app-breadcrumb />
      <router-outlet />
    </main>
    <app-footer [attr.inert]="loading() ? '' : null" />
  `,
  // Footer always at the bottom of the screen, even with little content.
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
    }
    main {
      flex: 1;
    }
  `,
})
export class App {
  protected readonly loading = injectGlobalLoading();
}
