/**
 * Everything that can be turned on/off per environment (environments/*.ts).
 * New flag: add it here and the compiler points to the environments that need a value.
 */
export interface FeatureFlags {
  /** Requires sign-in. Off = open app, no login screen and no role check. */
  readonly authentication: boolean;
  /** Checks roles (admin, operator...). Off = any signed-in user can access everything. */
  readonly roleControl: boolean;
  /** Admin area (/admin and the menu link). */
  readonly adminArea: boolean;
  /** Suppliers screen (/fornecedores and the menu link). */
  readonly suppliers: boolean;
  /** Preloads in the background the routes marked with `data: { preload: true }`. */
  readonly preload: boolean;
  /** Animates screen changes (the browser's View Transitions API). */
  readonly screenTransitions: boolean;
  /** TanStack Query panel (floating button). */
  readonly queryDevtools: boolean;
}

export type FeatureFlag = keyof FeatureFlags;
