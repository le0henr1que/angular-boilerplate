import { createEnvironmentInjector, EnvironmentInjector, inject, Injectable } from '@angular/core';
import { type LoadedMsal } from './msal.types';

/**
 * Downloads MSAL only when `msal` mode is actually used.
 *
 * MSAL is ~40% of what the initial bundle would be. Static, it would ship to every environment,
 * including the ones using mock/bff or with authentication off. Here it becomes a separate chunk,
 * downloaded once (when checking the session, before the 1st route) and reused by the gateway and
 * by the token interceptor.
 *
 * The MSAL providers go into a child injector created on the spot: the root injector is already
 * built when the chunk arrives, and providers can't be registered on it afterwards.
 */
@Injectable({ providedIn: 'root' })
export class MsalLoader {
  readonly #parent = inject(EnvironmentInjector);
  #loaded: Promise<LoadedMsal> | undefined;

  load(): Promise<LoadedMsal> {
    this.#loaded ??= import('./msal.chunk').then(
      (chunk) => ({
        chunk,
        // MsalAuthGateway is providedIn: 'root'; listed here, it is created in the child and sees MSAL.
        injector: createEnvironmentInjector(
          [chunk.provideMsal(), chunk.MsalAuthGateway],
          this.#parent,
          'msal',
        ),
      }),
      (error: unknown) => {
        // Download failed (network, new deploy): allows trying again on the next call.
        this.#loaded = undefined;
        throw error;
      },
    );
    return this.#loaded;
  }
}
