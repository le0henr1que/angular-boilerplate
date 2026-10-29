import { type Role } from './auth.enums';

/** Shape the backend returns from GET auth.urls.user (the "/me"). */
export interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly roles: readonly Role[];
}

/** A test user of the simulated login (auth.mode = 'mock'). */
export interface MockPersona {
  readonly id: string;
  /** Shown on the login screen. */
  readonly description: string;
  readonly user: User;
}
