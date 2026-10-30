/**
 * Tipos de Cardinalidades Suportadas para Relacionamentos no BRMM
 */
export const CARDINALITIES = [
  { label: '1 : 1 (Um para Um)', value: '1:1' },
  { label: '1 : N (Um para Muitos)', value: '1:N' },
  { label: 'N : N (Muitos para Muitos)', value: 'N:N' },
];

export const DEFAULT_CARDINALITY = '1:N';
