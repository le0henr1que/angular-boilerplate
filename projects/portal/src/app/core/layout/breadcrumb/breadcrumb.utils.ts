import { type TrailItem } from './breadcrumb.types';

/** Routes where the trail doesn't show (first URL segment). */
const ROUTES_WITHOUT_TRAIL = ['login'];

/** "sem-permissao" → "Sem Permissao" */
export function formatSegment(segment: string): string {
  return decodeURIComponent(segment)
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** "/produtos/novo-item?x=1" → [Produtos (/produtos), Novo Item (/produtos/novo-item)] */
export function buildTrail(url: string): TrailItem[] {
  const segments = url.split(/[?#]/)[0].split('/').filter(Boolean);
  if (ROUTES_WITHOUT_TRAIL.includes(segments[0])) return [];
  return segments.map((segment, i) => ({
    label: formatSegment(segment),
    route: '/' + segments.slice(0, i + 1).join('/'),
  }));
}
