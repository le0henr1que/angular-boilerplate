import { SUPPLIERS_ROUTE } from '../../models/registration.constants';
import { type SuppliersTab } from './suppliers-layout.types';

/** The layout route itself (/fornecedores), for a relative routerLink. */
const CURRENT_ROUTE = '.';

/** Tabs of the suppliers area. Links are relative to the layout route (/fornecedores). */
export const SUPPLIERS_TABS: readonly SuppliersTab[] = [
  { label: 'Fornecedores', link: CURRENT_ROUTE, exact: true },
  { label: 'Categorias', link: SUPPLIERS_ROUTE.categories, exact: false },
];
