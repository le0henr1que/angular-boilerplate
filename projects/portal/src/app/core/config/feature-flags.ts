import { inject } from '@angular/core';
import { type CanMatchFn } from '@angular/router';
import { APP_CONFIG } from './app-config.tokens';
import { type FeatureFlag, type FeatureFlags } from './feature-flags.types';

/** Reads the flags anywhere with DI: `const flags = injectFeatures(); flags.adminArea`. */
export function injectFeatures(): FeatureFlags {
  return inject(APP_CONFIG).features;
}

/** Route gate: with the flag off the route "doesn't exist" (falls into the 404) and its chunk isn't downloaded. */
export function requireFeature(flag: FeatureFlag): CanMatchFn {
  return () => injectFeatures()[flag];
}
