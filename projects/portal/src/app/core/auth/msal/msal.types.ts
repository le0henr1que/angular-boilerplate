import { type EnvironmentInjector } from '@angular/core';
import type * as Msal from './msal.chunk';

export type MsalChunk = typeof Msal;

export interface LoadedMsal {
  /** Child injector of the root, with MSAL (`MSAL` token → PublicClientApplication). */
  readonly injector: EnvironmentInjector;
  readonly chunk: MsalChunk;
}
