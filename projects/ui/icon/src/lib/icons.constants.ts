/*
 * Hand-drawn icons on a 24×24 grid, stroke only.
 * Each icon is a list of SVG paths (the "d" of a <path>).
 * To add one: draw it on the 24×24 grid and add it here.
 */

/** A circle written as a path, so everything is a <path>. */
const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;

export const ICONS = {
  'arrow-left': ['M19 12H5', 'm12 19-7-7 7-7'],
  'arrow-down': ['M12 5v14', 'm19 12-7 7-7-7'],
  'arrow-right': ['M5 12h14', 'm12 5 7 7-7 7'],
  'arrow-up': ['M12 19V5', 'm5 12 7-7 7 7'],
  'arrow-up-down': ['m21 16-4 4-4-4', 'M17 20V4', 'm3 8 4-4 4 4', 'M7 4v16'],
  'chevron-left': ['m15 18-6-6 6-6'],
  'chevron-right': ['m9 18 6-6-6-6'],
  'circle-alert': [circle(12, 12, 10), 'M12 8v4', 'M12 16h.01'],
  'file-search': [
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
    'M14 2v6h6',
    circle(11.5, 14.5, 2.5),
    'm13.3 16.3 1.7 1.7',
  ],
  moon: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z'],
  search: [circle(11, 11, 8), 'm21 21-4.3-4.3'],
  'search-x': [circle(11, 11, 8), 'm21 21-4.3-4.3', 'm13.5 8.5-5 5', 'm8.5 8.5 5 5'],
  'shopping-cart': [
    circle(8, 21, 1),
    circle(19, 21, 1),
    'M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12',
  ],
  sun: [
    circle(12, 12, 4),
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
