import { Injectable } from '@angular/core';
import { type PreloadingStrategy, type Route } from '@angular/router';
import { type Observable, of } from 'rxjs';

/**
 * Preloads in the background only the routes with `data: { preload: true }`,
 * and nothing when the user turned on data saver.
 *
 * Warning: `canMatch` does NOT prevent preloading. Don't flag role-restricted routes.
 */
@Injectable({ providedIn: 'root' })
export class FlagPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    const wantsPreload = route.data?.['preload'] === true;
    return wantsPreload && !connection?.saveData ? load() : of(null);
  }
}
