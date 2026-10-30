/**
 * Tipos de Cardinalidades Suportadas para Relacionamentos no BRMM
 * Validados tanto na camada de aplicação quanto no banco SQLite via restrição CHECK.
 */
export const CARDINALITIES = [
  { label: '1 : 1 (Um para Um)', value: '1:1' },
  { label: '1 : N (Um para Muitos)', value: '1:N' },
  { label: 'N : N (Muitos para Muitos)', value: 'N:N' },
];

export const VALID_CARDINALITY_VALUES = CARDINALITIES.map((c) => c.value);

export const DEFAULT_CARDINALITY = '1:N';

/**
 * Verifica se uma cardinalidade é suportada no MVP.
 * @param {string} cardinality
 * @returns {boolean}
 */
export function isValidCardinality(cardinality) {
  if (!cardinality || typeof cardinality !== 'string') return false;
  return VALID_CARDINALITY_VALUES.includes(cardinality.trim());
}
