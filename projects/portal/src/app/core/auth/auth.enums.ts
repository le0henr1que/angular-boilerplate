/**
 * The system's roles. With Azure AD, they are the app registration's "App roles":
 * the backend reads the token's `roles` claim and returns them here already translated.
 */
export const ROLE = {
  admin: 'admin',
  operator: 'operator',
  customer: 'customer',
} as const;
export type Role = (typeof ROLE)[keyof typeof ROLE];

/** Every known role (roles from the token outside this list are ignored). */
export const ROLES: readonly Role[] = Object.values(ROLE);
