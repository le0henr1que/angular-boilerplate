/*
 * Ícones desenhados à mão, numa grade de 24×24, só com traço (stroke).
 * Cada ícone é uma lista de caminhos SVG (o "d" de um <path>).
 * Para criar um novo: desenhe na grade 24×24 e acrescente aqui.
 */

/** Círculo escrito como caminho, para tudo ser <path>. */
const circulo = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;

export const ICONES = {
  'arrow-left': ['M19 12H5', 'm12 19-7-7 7-7'],
  'arrow-right': ['M5 12h14', 'm12 5 7 7-7 7'],
  'circle-alert': [circulo(12, 12, 10), 'M12 8v4', 'M12 16h.01'],
  'file-search': [
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
    'M14 2v6h6',
    circulo(11.5, 14.5, 2.5),
    'm13.3 16.3 1.7 1.7',
  ],
  moon: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z'],
  search: [circulo(11, 11, 8), 'm21 21-4.3-4.3'],
  'search-x': [circulo(11, 11, 8), 'm21 21-4.3-4.3', 'm13.5 8.5-5 5', 'm8.5 8.5 5 5'],
  'shopping-cart': [
    circulo(8, 21, 1),
    circulo(19, 21, 1),
    'M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12',
  ],
  sun: [
    circulo(12, 12, 4),
    'M12 2v2',
    'M12 20v2',
    'm4.93 4.93 1.41 1.41',
    'm17.66 17.66 1.41 1.41',
    'M2 12h2',
    'M20 12h2',
    'm6.34 17.66-1.41 1.41',
    'm19.07 4.93-1.41 1.41',
  ],
} satisfies Record<string, string[]>;

export type IconName = keyof typeof ICONES;
