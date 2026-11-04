export interface SuppliersTab {
  label: string;
  /** routerLink, relative to the layout route. */
  link: string;
  /** Active only on this exact URL (the first tab is the parent route itself). */
  exact: boolean;
}
